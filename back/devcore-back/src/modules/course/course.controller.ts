import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CoursesService } from './course.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { CreateCourseDto } from './dto/create-course.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('create')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Introduccion a NESTJS' },
        description: { type: 'string', example: 'Aprende NESTJS desde cero' },
        price: { type: 'number', example: 49.99 },

        image: {
          type: 'string',
          format: 'binary',
          description:
            'Imagen de portada del curso (formatos: jpg, jpeg, png, webp — máximo 2 MB)',
        },
      },
    },
  })
  async createCourse(
    @Body() data: CreateCourseDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2 * 1024 * 1024, // 2 MB
            message: 'La imagen no puede superar los 2 MB.',
          }),
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|webp)$/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('La imagen del curso es obligatoria.');
    }

    const uploadResult = await this.cloudinaryService.uploadImage(file);

    if (!uploadResult) throw new NotFoundException();

    return this.coursesService.createCourse({
      ...data,
      image: uploadResult.secure_url,
    });
  }

  @Get()
  async getAllLessons() {
    return await this.coursesService.getAllCourses();
  }

  @Get(':id')
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.coursesService.getCourseById(id);
  }
}
