import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Course } from '../course/entities/course.entity';
import { CategoryController } from './category.controller';
import { CategoriesService } from './category.service';
import { CategoriesRepository } from './category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Course])],
  controllers: [CategoryController],
  providers: [CategoriesService, CategoriesRepository],
  exports: [],
})
export class CategoryModule {}
