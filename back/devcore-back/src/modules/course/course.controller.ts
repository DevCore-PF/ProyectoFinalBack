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
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'videos', maxCount: 5 },
      { name: 'pdfs', maxCount: 10 },
    ]),
  )
  @ApiBody({ type: CreateLessonDto })
  async addLessonToCourse(
    @Param('courseId') courseId: string,
    @Body() data: CreateLessonDto,
    @UploadedFiles()
    files?: { videos?: Express.Multer.File[]; pdfs?: Express.Multer.File[] },
  ) {
    const course = await this.coursesService.getCourseById(courseId);

    if (!course) {
      throw new NotFoundException(`Curso con ID ${courseId} no encontrado`);
    }

    // Subidas y validaciones personalizadas
    const videoUrls = await this.uploadFiles(files?.videos, 'video', 'videos');
    const pdfUrls = await this.uploadFiles(files?.pdfs, 'pdf', 'PDFs');

    return this.coursesService.addLessonToCourse(courseId, {
      ...data,
      urlVideos: videoUrls,
      urlPdfs: pdfUrls,
    });
  }

  private async uploadFiles(
    files: Express.Multer.File[] | undefined,
    fileType: 'video' | 'pdf',
    fileTypeName: string,
  ): Promise<string[]> {
    if (!files?.length) return [];

    const maxSize = 50 * 1024 * 1024; // 50 MB

    for (const file of files) {
      if (file.size > maxSize) {
        throw new BadRequestException(
          `El ${fileTypeName} "${file.originalname}" supera los 50 MB.`,
        );
      }

      if (fileType === 'video' && !file.mimetype.startsWith('video/')) {
        throw new BadRequestException(
          `"${file.originalname}" no es un archivo de video válido.`,
        );
      }

      if (fileType === 'pdf' && file.mimetype !== 'application/pdf') {
        throw new BadRequestException(
          `"${file.originalname}" no es un archivo PDF válido.`,
        );
      }
    }

    try {
      const uploadPromises = files.map((file) =>
        fileType === 'video'
          ? this.cloudinaryService.uploadVideo(file)
          : this.cloudinaryService.uploadLessonDocument(file),
      );

      const uploadResults = await Promise.all(uploadPromises);

      const fileUrls = uploadResults
        .filter((result): result is UploadApiResponse => !!result?.secure_url)
        .map((result) => result.secure_url);

      if (fileUrls.length !== files.length) {
        throw new BadRequestException(
          `Error al subir uno o más ${fileTypeName}. Verificá el formato y tamaño.`,
        );
      }

      return fileUrls;
    } catch (error) {
      throw new BadRequestException(
        `Error al procesar los ${fileTypeName}. Intentá nuevamente.`,
      );
    }
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
