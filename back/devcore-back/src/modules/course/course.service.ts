import { Injectable, NotFoundException } from '@nestjs/common';
import { CoursesRepository } from './course.repository';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course } from './entities/course.entity';

@Injectable()
export class CoursesService {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  async createCourse(
    data: CreateCourseDto & { image: string },
  ): Promise<Course> {
    try {
      const course = await this.coursesRepository.createCourse(data);
      return course;
    } catch (error) {
      throw new NotFoundException('Error creating course: ' + error.message);
    }
  }

  async getAllCourses(): Promise<Course[]> {
    return this.coursesRepository.findAll();
  }

  async getCourseById(id: string): Promise<Course> {
    const course = await this.coursesRepository.findById(id);
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }
}
