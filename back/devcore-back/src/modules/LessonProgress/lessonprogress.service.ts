import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LessonProgressRepository } from './lessonprogress.repository';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Repository } from 'typeorm';
import { EnrollmentService } from '../enrollments/enrollments.service';
import { LessonsRepository } from '../lesson/lesson.repository';

@Injectable()
export class LessonProgressService {
  constructor(
    private readonly lessonProgressRepository: LessonProgressRepository,
    private readonly lessonRepository: LessonsRepository,
  ) {}

  async markLessonCompleted(userId: string, lessonId: string) {
    const user = await this.lessonProgressRepository.findUser(userId);
    const lesson = await this.lessonProgressRepository.findLesson(lessonId);

    if (!user || !lesson)
      throw new NotFoundException('Usuario o lección no encontrada.');

    const enrollment = await this.lessonProgressRepository.findEnrollment(
      user.id,
      lesson.course.id,
    );

    if (!enrollment)
      throw new ForbiddenException(
        'No puedes completar esta lección porque no estás inscrito en el curso.',
      );

    let progress = await this.lessonProgressRepository.findProgress(
      user.id,
      lesson.id,
    );

    if (!progress) {
      progress = this.lessonProgressRepository.createProgress(user, lesson);
    } else {
      progress.completed = true;
      progress.completedAt = new Date();
    }

    const saveProgress =
      await this.lessonProgressRepository.saveProgress(progress);

    await this.updateEnrollmentProgress(user.id, lesson.course.id);

    return saveProgress;
  }

  async getCompletedLessons(userId: string, courseId: string) {
    const completedLessons =
      await this.lessonProgressRepository.findCompletedLessonsByCourse(
        userId,
        courseId,
      );

    if (!completedLessons.length) {
      return {
        message: 'No hay lecciones completadas para este curso.',
      };
    }

    return {
      courseId,
      totalCompleted: completedLessons.length,
      lessons: completedLessons.map((p) => p.lesson),
    };
  }

  private async updateEnrollmentProgress(userId: string, courseId: string) {
    const courseLessons =
      await this.lessonRepository.findLessonsByCourseId(courseId);
    const totalLessons = courseLessons.length;

    if (totalLessons === 0) return;

    const completedLessons = await this.lessonProgressRepository.countCompleted(
      userId,
      courseId,
    );

    const progressPercentage = (completedLessons / totalLessons) * 100;

    await this.lessonProgressRepository.updateEnrollmentProgress(
      userId,
      courseId,
      progressPercentage,
    );
  }
}
