import { Module } from '@nestjs/common';
import { LessonsService } from './lesson.service';
import { LessonsRepository } from './lesson.repository';
import { LessonsController } from './lesson.controller';
import { Lesson } from './entities/lesson.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { CoursesRepository } from '../course/course.repository';
import { CoursesModule } from '../course/course.module';

@Module({
  controllers: [LessonsController],
  providers: [LessonsService, LessonsRepository],
  imports: [
    TypeOrmModule.forFeature([Lesson]),
    CloudinaryModule,
    CoursesModule,
  ],
  exports: [LessonsRepository],
})
export class LessonsModule {}
