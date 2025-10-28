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
        title: { type: 'string', example: 'Intro to NestJS' },
        description: { type: 'string', example: 'Learn NestJS from scratch' },
        price: { type: 'number', example: 49.99 },
        estado: {
          type: 'string',
          enum: ['DRAFT', 'PUBLISHED'],
          example: 'DRAFT',
        },
        image: {
          type: 'string',
          format: 'binary',
          description:
            'Course cover image (formats: jpg, jpeg, png, webp — max 2MB)',
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
            message: 'The image cannot exceed 2MB.',
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
      throw new BadRequestException('Course image is required.');
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
