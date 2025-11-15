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
    enrollmentData: { courseId: string; priceInCents: number, paymentId: string}[],
  ) {
    const enrollments = enrollmentData.map((data) => {

      const price = data.priceInCents / 100.0;

      const professorShare = price * 0.70;
      const adminShare = price * 0.30;


      return this.enrollmentRepository.create({
        user: { id: userId },
        course: { id: data.courseId },
        progress: 0,
        priceAtPurchase: data.priceInCents / 100.0,
        payment: {id: data.paymentId},

        professsorEarnings: professorShare,
        adminEarnings: adminShare,
        payout: undefined,
      });
    });

    await this.enrollmentRepository.save(enrollments);
  }
}
