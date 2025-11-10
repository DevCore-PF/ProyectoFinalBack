import { Injectable, NotFoundException } from '@nestjs/common';
import { EnrollmentRepository } from './enrollments.repository';
import { LessonsRepository } from '../lesson/lesson.repository';
import { In } from 'typeorm';
import { LessonProgressRepository } from '../LessonProgress/lessonprogress.repository';

@Injectable()
export class EnrollmentService {
  constructor(
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly lessonsRepository: LessonsRepository,
    private readonly lessonsProgressRepository: LessonProgressRepository,
  ) {}

  async createEnrollmentsForUser(
    userId: string,
    enrollmentData: { courseId: string; priceInCents: number }[],
  ) {
    const enrollments = enrollmentData.map((data) => {
      return this.enrollmentRepository.create({
        user: { id: userId },
        course: { id: data.courseId },
        progress: 0,
        priceAtPurchase: data.priceInCents / 100.0,
      });
    });

    await this.enrollmentRepository.save(enrollments);
  }
}
