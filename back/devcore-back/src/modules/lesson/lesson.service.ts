import { Injectable, NotFoundException } from '@nestjs/common';
import { LessonsRepository } from './lesson.repository';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { Lesson } from './entities/lesson.entity';

@Injectable()
export class LessonsService {
  constructor(private readonly lessonsRepository: LessonsRepository) {}

  async createLesson(data: CreateLessonDto): Promise<Lesson> {
    try {
      const newLesson = await this.lessonsRepository.createLesson(data);
      return newLesson;
    } catch (error) {
      throw new NotFoundException('Error creating lesson: ' + error.message);
    }
  }

  async getAllLessons(): Promise<Lesson[]> {
    return this.lessonsRepository.getAllLessons();
  }

  async getLessonById(id: string): Promise<Lesson> {
    const lesson = await this.lessonsRepository.getLessonById(id);
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }
}
