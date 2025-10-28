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
        title: {
          type: 'string',
          example: 'Introducción a NestJS',
          description: 'Título del curso que se desea crear.',
        },
        description: {
          type: 'string',
          example: 'Aprendé NestJS desde cero y construí APIs profesionales.',
          description: 'Descripción general del curso.',
        },
        price: {
          type: 'number',
          example: 49.99,
          description: 'Precio del curso en dólares (USD).',
        },
        // status: {
        //   type: 'string',
        //   enum: ['DRAFT', 'PUBLISHED'],
        //   example: 'DRAFT',
        //   description: 'Estado del curso: borrador o publicado.',
        // },
        duration: {
          type: 'string',
          example: '4h 30m',
          description: 'Duración total del curso (por ejemplo: "3h 45m").',
        },
        difficulty: {
          type: 'string',
          enum: ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'],
          example: 'PRINCIPIANTE',
          description:
            'Nivel de dificultad del curso. Este campo es obligatorio y debe seleccionarse.',
        },
        lessons: {
          type: 'array',
          items: { type: 'string' },
          example: ['Lección 1: Introducción', 'Lección 2: Fundamentos'],
          description: 'Lista de lecciones incluidas en el curso.',
        },
        image: {
          type: 'string',
          format: 'binary',
          description:
            'Imagen de portada del curso (formatos: jpg, jpeg, png, webp — máximo 2 MB).',
        },
      },
      required: [
        'title',
        'description',
        'duration',
        'price',
        'difficulty',
        'image',
        'lessons',
      ],
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
