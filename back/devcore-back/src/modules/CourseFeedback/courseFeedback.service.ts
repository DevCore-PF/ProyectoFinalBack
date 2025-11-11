import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CourseFeedbackRepository } from './courseFeedback.repository';
import { CreateCourseFeedbackDto } from './dto/courseFeedback.dto';
import { User } from '../users/entities/user.entity';
import { CourseFeedback } from './entities/courseFeedback.entity';

@Injectable()
export class CourseFeedbackService {
  constructor(private readonly feedbackRepo: CourseFeedbackRepository) {}

  async createFeedback(
    userId: string,
    courseId: string,
    dto: CreateCourseFeedbackDto,
  ) {
    const user = await this.feedbackRepo.findUser(userId);
    const course = await this.feedbackRepo.findCourse(courseId);

    if (!user || !course)
      throw new NotFoundException('Usuario o curso no encontrado.');

    const enrollment = await this.feedbackRepo.findEnrollment(userId, courseId);
    if (!enrollment)
      throw new BadRequestException(
        'El usuario no está inscripto en este curso.',
      );

    const existingFeedback = await this.feedbackRepo.findExistingFeedback(
      userId,
      courseId,
    );
    if (existingFeedback)
      throw new BadRequestException(
        'Ya dejaste una valoración para este curso.',
      );

    const feedback = this.feedbackRepo.createFeedback(user, course, dto);
    return await this.feedbackRepo.saveFeedback(feedback);
  }
}
