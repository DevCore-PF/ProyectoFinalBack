import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { EnrollmentService } from './enrollments.service';
import { EnrollmentRepository } from './enrollments.repository';
import { LessonsModule } from '../lesson/lesson.module';
import { LessonProgressModule } from '../LessonProgress/lessonprogress.module';
import { Course } from '../course/entities/course.entity';
import { User } from '../users/entities/user.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Payout } from '../admin/entities/payout.entity';
import { ProfessorProfile } from '../profiles/entities/professor-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment,Course,
      User,
      Payment,
      Payout,
      ProfessorProfile,]),
    LessonsModule,
    LessonProgressModule,
  ],
  providers: [EnrollmentService, EnrollmentRepository],
  exports: [EnrollmentService, EnrollmentRepository],
})
export class EnrollmentsModule {}
