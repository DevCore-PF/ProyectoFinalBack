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
import { ApiBody, ApiConsumes, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CreateCourseDto } from './dto/create-course.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateLessonDto } from '../lesson/dto/create-lesson.dto';
import { UploadApiResponse } from 'cloudinary';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post(':professorId/create')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiParam({
    name: 'professorId',
    description: 'ID del profesor',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: CreateCourseDto })
  async createCourse(
    @Param('professorId') professorId: string,
    @Body() data: CreateCourseDto,
  ) {
    return this.coursesService.createCourse(professorId, data);
  }

  @Post(':courseId/lessons')
  @ApiConsumes('multipart/form-data', 'application/x-www-form-urlencoded')
  @UseInterceptors(FilesInterceptor('videos', 5)) // Máximo 5 videos
  @ApiBody({ type: CreateLessonDto })
  async addLessonToCourse(
    @Param('courseId') courseId: string,
    @Body() data: CreateLessonDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 50 * 1024 * 1024, // 50 MB por video
            message: 'Cada video no puede superar los 50 MB.',
          }),
          new FileTypeValidator({
            fileType: /(mp4|mov|avi|webm)$/i,
          }),
        ],
        fileIsRequired: false, // Videos opcionales
      }),
    )
    files?: Express.Multer.File[],
  ) {
    const course = await this.coursesService.getCourseById(courseId);

    if (!course) {
      throw new NotFoundException(`Curso con ID ${courseId} no encontrado`);
    }

    let videoUrls: string[] = [];

    if (files && files.length > 0) {
      if (files.length > 5) {
        throw new BadRequestException('Podés subir un máximo de 5 videos.');
      }

      const uploadPromises = files.map((file) =>
        this.cloudinaryService.uploadVideo(file),
      );

      const uploadResults = await Promise.all(uploadPromises);

      if (uploadResults.some((result) => !result || !result.secure_url)) {
        throw new BadRequestException('Error al subir uno o más videos.');
      }

      videoUrls = uploadResults
        .filter((result): result is UploadApiResponse => !!result?.secure_url)
        .map((result) => result.secure_url);
    }

    return this.coursesService.addLessonToCourse(courseId, {
      ...data,
      urlVideos: videoUrls,
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
