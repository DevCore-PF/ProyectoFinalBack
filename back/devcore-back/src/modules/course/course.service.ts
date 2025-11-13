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
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class CoursesService {
  constructor(
    private readonly coursesRepository: CoursesRepository,
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,
    @InjectRepository(ProfessorProfile)
    private readonly professorRepository: Repository<ProfessorProfile>,
    private readonly usersRepository: UsersRepository,
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

  async createCourseAdmin(
    adminId: string,
    data: CreateCourseDto,
  ): Promise<Course> {
    const admin = await this.usersRepository.findUserById(adminId);
    if (!admin) {
      throw new NotFoundException('Usuario administrador no encontrado');
    }
    const newCourse = await this.coursesRepository.createCourseAdmin({
      ...data,
      user: admin,
      isActive: true,
      status: CourseStatus.PUBLISHED,
    });

    return newCourse;
  }

  async getAllCourses(
    title?: string,
    category?: string,
    difficulty?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<Course[]> {
    return this.coursesRepository.findAll(
      title,
      category,
      difficulty,
      sortBy,
      sortOrder,
    );
  }

  async getCourseById(id: string): Promise<Course> {
    const course = await this.coursesRepository.findById(id);
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }
  async getAllPulicCourses() {
    return await this.coursesRepository.getAllPulicCourses();
  }

  async getAllCoursesAdmin(
    title?: string,
    category?: string,
    difficulty?: string,
    isActive?: boolean,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<Course[]> {
    return this.coursesRepository.findAllAdmin(
      title,
      category,
      difficulty,
      isActive,
      sortBy,
      sortOrder,
    );
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

  async aprovedCourse(courseId: string) {
    const courseFind = await this.coursesRepository.findById(courseId);
    if (!courseFind) throw new NotFoundException('Curso no encontrado');
    courseFind.status = CourseStatus.PUBLISHED;
    await this.coursesRepository.updateCourse(courseFind);
  }

  async declineCourse(courseId: string) {
    const courseFind = await this.coursesRepository.findById(courseId);
    if (!courseFind) throw new NotFoundException('Curso no encontrado');
    courseFind.status = CourseStatus.REJECT;
    await this.coursesRepository.updateCourse(courseFind);
  }
}
