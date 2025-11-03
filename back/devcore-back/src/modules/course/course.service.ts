import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CoursesRepository } from './course.repository';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course } from './entities/course.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { CreateLessonDto } from '../lesson/dto/create-lesson.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfessorProfile } from '../profiles/entities/professor-profile.entity';

@Injectable()
export class CoursesService {
  constructor(
    private readonly coursesRepository: CoursesRepository,
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,
    @InjectRepository(ProfessorProfile)
    private readonly professorRepository: Repository<ProfessorProfile>,
  ) {}

  async createCourse(
    professorId: string,
    data: CreateCourseDto,
  ): Promise<Course> {
    try {
      const professor = await this.professorRepository.findOne({
        where: { id: professorId },
      });

      if (!professor) {
        throw new NotFoundException(
          `Profesor con ID ${professorId} no encontrado`,
        );
      }

      return await this.coursesRepository.createCourse({
        ...data,
        professor,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Error al crear el curso: ' + error.message,
      );
    }
  }

  async getAllCourses(title?: string): Promise<Course[]> {
    return this.coursesRepository.findAll(title);
  }

  async getCourseById(id: string): Promise<Course> {
    const course = await this.coursesRepository.findById(id);
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async addLessonToCourse(
    courseId: string,
    lessonData: CreateLessonDto & { urlVideos: string[]; urlPdfs: string[] },
  ): Promise<Lesson> {
    const course = await this.coursesRepository.findById(courseId);

    if (!course) {
      throw new NotFoundException(`Curso con ID ${courseId} no encontrado`);
    }

    const order = course.lessons ? course.lessons.length + 1 : 1;

    const lesson = this.lessonsRepository.create({
      title: lessonData.title,
      urlVideos: lessonData.urlVideos || [],
      urlPdfs: lessonData.urlPdfs || [],
      order,
      course,
    });

    return await this.lessonsRepository.save(lesson);
  }
}
