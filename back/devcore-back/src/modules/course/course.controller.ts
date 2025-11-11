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
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CoursesService } from './course.service';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateCourseDto } from './dto/create-course.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateLessonDto } from '../lesson/dto/create-lesson.dto';
import { UploadApiResponse } from 'cloudinary';
import { IsOptional } from 'class-validator';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiUpdateCourseDocs } from './doc/update-course.doc';
import { ApiCreateCourseDoc } from './doc/createCourse.doc';
import { ApiCreateLessonDoc } from './doc/createLesson.doc';
import { ApiGetCouseDoc } from './doc/getCourse.doc';
import { ApiGetCourseByIdDoc } from './doc/getCourseById.doc';
import { AuthGuard } from '@nestjs/passport';
import { CourseFeedback } from '../CourseFeedback/entities/courseFeedback.entity';
import { CourseFeedbackService } from '../CourseFeedback/courseFeedback.service';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly feedbackService: CourseFeedbackService,
  ) {}

  @Post(':professorId/create')
  @ApiCreateCourseDoc()
  async createCourse(
    @Param('professorId') professorId: string,
    @Body() data: CreateCourseDto,
  ) {
    return this.coursesService.createCourse(professorId, data);
  }

  @Post(':courseId/lessons')
  @ApiCreateLessonDoc()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'videos', maxCount: 5 },
      { name: 'pdfs', maxCount: 10 },
    ]),
  )
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
        .map((result) => {
          // Si es PDF, agregar fl_attachment:false para que se visualice en el navegador
          if (fileType === 'pdf') {
            return result.secure_url.replace(
              '/upload/',
              '/upload/fl_attachment/',
            );
          }
          return result.secure_url;
        });

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
  @ApiGetCouseDoc()
  async getAllCourses(@Query('title') title?: string) {
    return await this.coursesService.getAllCourses(title);
  }

  @Get(':id')
  @ApiGetCourseByIdDoc()
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.coursesService.getCourseById(id);
  }

  @Patch(':id')
  @ApiUpdateCourseDocs()
  @ApiBody({ type: UpdateCourseDto })
  async updateCourseById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateCourseDto,
  ) {
    return await this.coursesService.updateCourseById(id, data);
  }

  @Get(':courseId/user-feedback')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async hasUserFeedback(@Param('courseId') courseId: string, @Req() req) {
    const userId = req.user.sub;
    const hasFeedback = await this.feedbackService.hasUserFeedback(
      userId,
      courseId,
    );
    return { hasFeedback };
  }

  @Patch('visibility/changeToPublic/:courseId')
  async changeVisivility(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return await this.coursesService.changeVisivility(courseId);
  }
}
