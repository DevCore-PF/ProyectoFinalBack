import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LessonProgressRepository } from './lessonprogress.repository';

@Injectable()
export class LessonProgressService {
  constructor(private readonly repository: LessonProgressRepository) {}

  async markLessonCompleted(userId: string, lessonId: string) {
    const user = await this.repository.findUser(userId);
    const lesson = await this.repository.findLesson(lessonId);

    if (!user || !lesson)
      throw new NotFoundException('Usuario o lección no encontrada.');

    const enrollment = await this.repository.findEnrollment(
      user.id,
      lesson.course.id,
    );

    if (!enrollment)
      throw new ForbiddenException(
        'No puedes completar esta lección porque no estás inscrito en el curso.',
      );

    let progress = await this.repository.findProgress(user.id, lesson.id);

    if (!progress) {
      progress = this.repository.createProgress(user, lesson);
    } else {
      progress.completed = true;
      progress.completedAt = new Date();
    }

    return this.repository.saveProgress(progress);
  }
}
