import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';

@Injectable()
export class LessonsRepository {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  async createLesson(data: CreateLessonDto): Promise<Lesson> {
    const lesson = this.lessonRepository.create(data);
    return await this.lessonRepository.save(lesson);
  }

  async getAllLessons(): Promise<Lesson[]> {
    return this.lessonRepository.find();
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    return this.lessonRepository.findOne({ where: { id } });
  }

  async findLessonsByCourseId(courseId: string): Promise<Lesson[]> {
    return this.lessonRepository.find({
      where: { course: { id: courseId } },
    });
  }

  async deleteLesson(data: Lesson) {
    return this.lessonRepository.save(data);
  }
}
