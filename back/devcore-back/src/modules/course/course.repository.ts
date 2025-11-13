import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin, ILike, In, Repository } from 'typeorm';
import { Course, CourseStatus, Visibility } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { ProfessorProfile } from '../profiles/entities/professor-profile.entity';
import { UsersRepository } from '../users/users.repository';
import { UserRole } from '../users/enums/user-role.enum';

@Injectable()
export class CoursesRepository {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createCourse(
    data: CreateCourseDto & { professor: ProfessorProfile },
  ): Promise<Course> {
    const course = this.courseRepository.create(data);
    course.status = CourseStatus.DRAFT;
    return await this.courseRepository.save(course);
  }

  async createCourseAdmin(courseData: Partial<Course>): Promise<Course> {
    const newCourse = this.courseRepository.create(courseData);
    return await this.courseRepository.save(newCourse);
  }

  async findAll(
    title?: string,
    category?: string,
    difficulty?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<Course[]> {
    const where: any = { isActive: true };

    if (title) {
      where.title = ILike(`%${title}%`);
    }

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    return await this.courseRepository.find({
      where,
      relations: ['lessons', 'professor.user', 'feedbacks'],
      order: {
        [sortBy]: sortOrder.toUpperCase(),
      },
    });
  }

  async getAllPulicCourses() {
    return await this.courseRepository.find({
      where: { visibility: Visibility.PUBLIC },
    });
  }

  async findAllAdmin(
    title?: string,
    category?: string,
    difficulty?: string,
    isActive?: boolean,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<Course[]> {
    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (title) {
      where.title = ILike(`%${title}%`);
    }

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    return await this.courseRepository.find({
      where,
      relations: ['lessons', 'professor.user', 'feedbacks'],
      order: {
        [sortBy]: sortOrder.toUpperCase(),
      },
    });
  }

  async findById(id: string): Promise<Course | null> {
    return this.courseRepository.findOne({
      where: { id },
      relations: ['lessons', 'feedbacks'],
    });
  }

  /**
   * Metodo que busca multiples cursos para el carrito de compras con stripe
   */
  async findCoursesByIds(ids: string[]): Promise<Course[]> {
    //usa el In para buscar en un arreglo de ids
    return this.courseRepository.find({
      where: { id: In(ids) },
      relations: {
        professor: { user: true },
      },
    });
  }

  async updateCourse(course) {
    return await this.courseRepository.save(course);
  }
}
