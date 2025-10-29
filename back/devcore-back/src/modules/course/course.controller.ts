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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CoursesService } from './course.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(FilesInterceptor('images', 3))
  @ApiBody({ type: CreateCourseDto })
  async createCourse(
    @Body() data: CreateCourseDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2 * 1024 * 1024, // 2 MB
            message: 'Cada imagen no puede superar los 2 MB.',
          }),
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|webp)$/i,
          }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException(
        'Debes subir al menos una imagen del curso.',
      );
    }

    if (files.length > 3) {
      throw new BadRequestException('Podés subir un máximo de 3 imágenes.');
    }

    const uploadPromises = files.map((file) =>
      this.cloudinaryService.uploadImage(file),
    );

    const uploadResults = await Promise.all(uploadPromises);

    if (uploadResults.some((result) => !result)) {
      throw new NotFoundException('Error al subir una o más imágenes.');
    }

    if (uploadResults.some((result) => !result || !result.secure_url)) {
      throw new BadRequestException(
        'Error al subir una o más imágenes. Intentá nuevamente.',
      );
    }
    const imageUrls = uploadResults.map((result) => result!.secure_url!);

    return this.coursesService.createCourse({
      ...data,
      images: imageUrls,
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
