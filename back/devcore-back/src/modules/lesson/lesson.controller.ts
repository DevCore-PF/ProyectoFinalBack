import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { LessonsService } from './lesson.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ApiGetAllLessonsDoc } from './doc/getAllLessons.doc';
import { ApiGetLessonByIdDoc } from './doc/getLessonById.doc';
import { ApiAddAditionalData } from './doc/addAditionalData.doc';

@Controller('lessons')
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  @ApiGetAllLessonsDoc()
  async getAllLessons() {
    return await this.lessonsService.getAllLessons();
  }

  @Get(':id')
  @ApiGetLessonByIdDoc()
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.lessonsService.getLessonById(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonsService.deleteLessonById(id);
  }

  @Post('aditionalData/:lessonId')
  @ApiAddAditionalData()
  async addAditionalData(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body() aditionalData: string[],
  ) {
    return await this.lessonsService.addAditionalData(lessonId, aditionalData);
  }
}
