import { Module } from '@nestjs/common';
import { CoursesController } from './course.controller';
import { CoursesService } from './course.service';
import { CoursesRepository } from './course.repository';
import { Course } from './entities/course.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Lesson } from '../lesson/entities/lesson.entity';
import { ProfessorProfile } from '../profiles/entities/professor-profile.entity';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService, CoursesRepository],
  imports: [
    TypeOrmModule.forFeature([Course, Lesson, ProfessorProfile]),
    CloudinaryModule,
  ],
  exports: [CoursesRepository],
})
export class CoursesModule {}
