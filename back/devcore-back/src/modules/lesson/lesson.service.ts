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

  async findLessonsByCourseId(courseId: string): Promise<Lesson[]> {
    return await this.lessonsRepository.findLessonsByCourseId(courseId);
  }

  async getLessonById(id: string): Promise<Lesson> {
    const lesson = await this.lessonsRepository.getLessonById(id);
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async deleteLessonById(id: string) {
    const LessonFind = await this.lessonsRepository.getLessonById(id);
    if (!LessonFind) throw new NotFoundException('Leccion no encontrada');
    LessonFind.isActive = false;
    await this.lessonsRepository.deleteLesson(LessonFind);
    return `Leccion ${LessonFind.title} desactiva correctamente`;
  }

  async addAditionalData(lessonId: string, aditionalData: string[]) {
    const lessonFind = await this.lessonsRepository.getLessonById(lessonId);
    if (!lessonFind) throw new NotFoundException('Leccion no encontrada');
    lessonFind.aditionalData = aditionalData;
    return await this.lessonsRepository.addAditionalData(lessonFind);
  }
}
