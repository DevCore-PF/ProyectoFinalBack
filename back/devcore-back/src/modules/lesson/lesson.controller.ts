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
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
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

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las lecciones',
    description:
      'Devuelve una lista con todas las lecciones registradas en el sistema. Puede incluir información como título, descripción, curso asociado y estado de publicación.',
  })
  async getAllLessons() {
    return await this.lessonsService.getAllLessons();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una lección por ID',
    description:
      'Devuelve la información detallada de una lección específica identificada por su ID. Incluye datos como título, contenido, duración y curso al que pertenece.',
  })
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.lessonsService.getLessonById(id);
  }
}
