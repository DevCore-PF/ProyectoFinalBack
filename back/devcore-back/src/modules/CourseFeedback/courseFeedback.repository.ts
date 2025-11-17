import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Course } from 'src/modules/course/entities/course.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Enrollment } from 'src/modules/enrollments/entities/enrollment.entity';
import { CourseFeedback, Rating } from './entities/courseFeedback.entity';
import { CreateCourseFeedbackDto } from './dto/courseFeedback.dto';
import { title } from 'process';

@Injectable()
export class CourseFeedbackRepository {
  constructor(
    @InjectRepository(CourseFeedback)
    private readonly feedbackRepo: Repository<CourseFeedback>,

    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  async findUser(userId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id: userId } });
  }

  async findCourse(courseId: string): Promise<Course | null> {
    return this.courseRepo.findOne({ where: { id: courseId } });
  }

  async findEnrollment(
    userId: string,
    courseId: string,
  ): Promise<Enrollment | null> {
    return this.enrollmentRepo.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
  }

  async findExistingFeedback(userId: string, courseId: string) {
    return await this.feedbackRepo.findOne({
      where: {
        user: { id: userId },
        course: { id: courseId },
      },
    });
  }

  async saveFeedback(feedback: CourseFeedback): Promise<CourseFeedback> {
    return this.feedbackRepo.save(feedback);
  }

  createFeedback(
    user: User,
    course: Course,
    dto: CreateCourseFeedbackDto,
  ): CourseFeedback {
    return this.feedbackRepo.create({
      user,
      course,
      rating: dto.rating,
      feedback: dto.feedback,
    });
  }

  async getAllFeedBacks() {
    return await this.feedbackRepo.find({
      relations: ['course', 'course.professor', 'course.professor.user'],
      select: {
        id: true,
        feedback: true,
        rating: true,
        // Campos de moderación
        isCensored: true,
        moderationStatus: true,
        toxicityScore: true,
        moderationReason: true,
        requiresManualReview: true,
        course: {
          id: true,
          title: true,
          description: true,
          professor: {
            id: true,
            speciality: true,
            biography: true,
            user: { id: true, name: true, isActive: true },
          },
        },
      },
      order: {
        rating: 'DESC',
      },
    });
  }

  // metodo del repositorio para feedback
  async getCourseFeedbacks(courseId: string) {
    return await this.feedbackRepo.find({
      where: { course: { id: courseId } },
      relations: ['user'],
      select: {
        id: true,
        rating: true,
        feedback: true,
        createdAt: true,
        // Campos de moderación
        isCensored: true,
        moderationStatus: true,
        toxicityScore: true,
        moderationReason: true,
        requiresManualReview: true,
        user: {
          id: true,
          name: true,
          image: true,
          isActive: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }
}
