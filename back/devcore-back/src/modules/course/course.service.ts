import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CoursesRepository } from './course.repository';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course, CourseStatus, Visibility } from './entities/course.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { CreateLessonDto } from '../lesson/dto/create-lesson.dto';
import { Not, Repository } from 'typeorm';
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

  async updateCourseById(id, data) {
    const courseFind = await this.coursesRepository.findById(id);
    if (!courseFind) throw new NotFoundException('Curso no encontrado');
    const { title, description, price, duration, difficulty, category, type } =
      data;

    if (title !== undefined) courseFind.title = title;
    if (description !== undefined) courseFind.description = description;
    if (price !== undefined) courseFind.price = price;
    if (duration !== undefined) courseFind.duration = duration;
    if (difficulty !== undefined) courseFind.difficulty = difficulty;
    if (category !== undefined) courseFind.category = category;
    if (type !== undefined) courseFind.type = type;

    return await this.coursesRepository.updateCourse(courseFind);
  }

  async changeVisivility(courseId: string) {
    const courseFind = await this.coursesRepository.findById(courseId);
    if (!courseFind) throw new NotFoundException('Curso no encontrado');
    if (courseFind.visibility === Visibility.PRIVATE) {
      courseFind.visibility = Visibility.PUBLIC;
    } else courseFind.visibility = Visibility.PRIVATE;
    await this.coursesRepository.updateCourse(courseFind);
    return courseFind;
  }

  async changeStatus(courseId: string) {
    const courseFind = await this.coursesRepository.findById(courseId);
    if (!courseFind) throw new NotFoundException('Curso no encontrado');
    if (courseFind.isActive === true) {
      courseFind.isActive = false;
      await this.coursesRepository.updateCourse(courseFind);
      return courseFind;
    } else {
      courseFind.isActive = true;
      await this.coursesRepository.updateCourse(courseFind);
      return courseFind;
    }
  }
}
