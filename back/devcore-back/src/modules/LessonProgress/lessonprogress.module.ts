import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonProgress } from './entities/lessoprogress.entity';
import { LessonProgressService } from './lessonprogress.service';
import { LessonProgressController } from './lessonprogress.controller';
import { Lesson } from 'src/modules/lesson/entities/lesson.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { LessonProgressRepository } from './lessonprogress.repository';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { LessonsModule } from '../lesson/lesson.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LessonProgress, Lesson, User, Enrollment]),
    LessonsModule,
  ],
  controllers: [LessonProgressController],
  providers: [LessonProgressService, LessonProgressRepository],
  exports: [LessonProgressService, LessonProgressRepository],
})
export class LessonProgressModule {}
