import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { EnrollmentService } from './enrollments.service';
import { EnrollmentRepository } from './enrollments.repository';
import { LessonsModule } from '../lesson/lesson.module';
import { LessonProgressModule } from '../LessonProgress/lessonprogress.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment]),
    LessonsModule,
    LessonProgressModule,
  ],
  providers: [EnrollmentService, EnrollmentRepository],
  exports: [EnrollmentService, EnrollmentRepository],
})
export class EnrollmentsModule {}
