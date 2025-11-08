import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/modules/users/entities/user.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { LessonProgress } from './entities/lessoprogress.entity';
import { Lesson } from '../lesson/entities/lesson.entity';

@Injectable()
export class LessonProgressRepository {
  constructor(
    @InjectRepository(LessonProgress)
    private readonly progressRepo: Repository<LessonProgress>,

    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  async findUser(userId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id: userId } });
  }

  async findLesson(lessonId: string): Promise<Lesson | null> {
    return this.lessonRepo.findOne({
      where: { id: lessonId },
      relations: ['course'],
    });
  }

  async findEnrollment(
    userId: string,
    courseId: string,
  ): Promise<Enrollment | null> {
    return this.enrollmentRepo.findOne({
      where: {
        user: { id: userId },
        course: { id: courseId },
      },
    });
  }

  async findProgress(
    userId: string,
    lessonId: string,
  ): Promise<LessonProgress | null> {
    return this.progressRepo.findOne({
      where: { user: { id: userId }, lesson: { id: lessonId } },
    });
  }

  async saveProgress(progress: LessonProgress): Promise<LessonProgress> {
    return this.progressRepo.save(progress);
  }

  createProgress(user: User, lesson: Lesson): LessonProgress {
    return this.progressRepo.create({
      user,
      lesson,
      completed: true,
      completedAt: new Date(),
    });
  }

  async findCompletedLessonsByCourse(userId: string, courseId: string) {
    return this.progressRepo.find({
      where: {
        user: { id: userId },
        lesson: { course: { id: courseId } },
        completed: true,
      },
      relations: ['lesson'],
      select: {
        lesson: {
          id: true,
          title: true,
        },
      },
    });
  }
}
