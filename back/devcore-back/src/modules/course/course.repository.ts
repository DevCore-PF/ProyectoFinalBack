import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { ProfessorProfile } from '../profiles/entities/professor-profile.entity';

@Injectable()
export class CoursesRepository {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async createCourse(
    data: CreateCourseDto & { professor: ProfessorProfile },
  ): Promise<Course> {
    const course = this.courseRepository.create(data);
    return await this.courseRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return this.courseRepository.find();
  }

  async findById(id: string): Promise<Course | null> {
    return this.courseRepository.findOne({
      where: { id },
      relations: ['lessons'],
    });
  }

  /**
   * Metodo que busca multiples cursos para el carrito de compras con stripe
   */
  async findCoursesByIds(ids: string[]): Promise<Course[]> {
    //usa el In para buscar en un arreglo de ids
    return this.courseRepository.find({
      where: { id: In(ids) },
    });
  }
}
