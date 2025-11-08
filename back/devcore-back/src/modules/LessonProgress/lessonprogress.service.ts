import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LessonProgressRepository } from './lessonprogress.repository';

@Injectable()
export class LessonProgressService {
  constructor(
    private readonly lessonProgressRepository: LessonProgressRepository,
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

    return this.lessonProgressRepository.saveProgress(progress);
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
}
