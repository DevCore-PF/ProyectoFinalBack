import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { LessonsService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';

@Controller('lessons')
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // @Post('create')
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(FileInterceptor('video'))
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       title: { type: 'string', example: 'Intro a NestJS' },
  //       description: { type: 'string', example: 'Aprendé NestJS desde cero' },
  //       video: {
  //         type: 'string',
  //         format: 'binary',
  //         description:
  //           'Archivo de video (obligatorio, formatos: mp4, mov, webm) Maximo 10 MB',
  //       },
  //     },
  //   },
  // })
  // async createLesson(
  //   @Body() data: CreateLessonDto,
  //   @UploadedFile(
  //     new ParseFilePipe({
  //       validators: [
  //         new MaxFileSizeValidator({
  //           maxSize: 10 * 1024 * 1024,
  //           message: 'El video no puede superar los 10 MB.',
  //         }),
  //         new FileTypeValidator({
  //           fileType: /(mp4|mov|webm)$/i,
  //         }),
  //       ],
  //     }),
  //   )
  //   file: Express.Multer.File,
  // ) {
  //   if (!file) {
  //     throw new BadRequestException('El archivo de video es obligatorio.');
  //   }

  //   const uploadResult = await this.cloudinaryService.uploadVideo(file);

  //   if (!uploadResult?.secure_url) {
  //     throw new BadRequestException('Error al subir el video a Cloudinary.');
  //   }

  //   const lessonData: CreateLessonDto & { urlVideo: string } = {
  //     ...data,
  //     urlVideo: uploadResult.secure_url,
  //   };

  //   return this.lessonsService.createLesson(lessonData);
  // }

  @Get()
  async getAllLessons() {
    return await this.lessonsService.getAllLessons();
  }

  @Get(':id')
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.lessonsService.getLessonById(id);
  }
}
