import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Course } from 'src/modules/course/entities/course.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Enrollment } from 'src/modules/enrollments/entities/enrollment.entity';
import { CourseFeedback } from './entities/courseFeedback.entity';
import { CourseFeedbackController } from './courseFeedback.controller';
import { CourseFeedbackRepository } from './courseFeedback.repository';
import { CourseFeedbackService } from './courseFeedback.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseFeedback, Course, User, Enrollment]),
  ],
  controllers: [CourseFeedbackController],
  providers: [CourseFeedbackRepository, CourseFeedbackService],
  exports: [CourseFeedbackService],
})
export class CourseFeedbackModule {}
