import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CourseFeedbackRepository } from './courseFeedback.repository';
import { CreateCourseFeedbackDto } from './dto/courseFeedback.dto';
import { User } from '../users/entities/user.entity';
import { CourseFeedback } from './entities/courseFeedback.entity';
import { ModerationService } from '../moderation/moderation.service';
import { ModerationResult } from '../moderation/interfaces/moderation-result.interface';

@Injectable()
export class CourseFeedbackService {
  constructor(
    private readonly feedbackRepo: CourseFeedbackRepository,
    private readonly moderationService: ModerationService, // NUEVO: inyectar servicio de moderación
  ) {}

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

    // ===== NUEVO: ANÁLISIS DE MODERACIÓN =====
    let moderationResult: ModerationResult | null = null;

    // Solo analizar si hay texto en el feedback
    if (dto.feedback && dto.feedback.trim().length > 0) {
      moderationResult = await this.moderationService.analyzeFeedback(
        dto.feedback,
      );

      // Si el feedback es EXTREMADAMENTE tóxico, rechazarlo y no guardarlo
      if (moderationResult.suggestedAction === 'reject') {
        throw new BadRequestException(
          moderationResult.reason ||
            'Su comentario no está permitido. En caso de reintentarlo será notificado al administrador.',
        );
      }
    }

    // Crear el feedback
    const feedback = this.feedbackRepo.createFeedback(user, course, dto);

    // Aplicar resultados de moderación si existen
    if (moderationResult) {
      feedback.toxicityScore = Number(
        moderationResult.toxicityScore.toFixed(2),
      );
      feedback.isCensored = moderationResult.suggestedAction === 'censor';
      feedback.requiresManualReview = moderationResult.requiresManualReview;
      if (moderationResult.reason) {
        feedback.moderationReason = moderationResult.reason;
      }

      // Determinar estado de moderación
      if (moderationResult.suggestedAction === 'censor') {
        feedback.moderationStatus = 'censored';
      } else if (moderationResult.requiresManualReview) {
        feedback.moderationStatus = 'pending';
      } else {
        feedback.moderationStatus = 'approved';
      }
    } else {
      // Si no hay texto o no se analizó, aprobar por defecto
      feedback.moderationStatus = 'approved';
    }

    const savedFeedback = await this.feedbackRepo.saveFeedback(feedback);

    // Retornar mensaje según el resultado
    const message =
      moderationResult?.suggestedAction === 'censor'
        ? 'Tu feedback ha sido publicado pero será visible de forma censurada debido a su contenido.'
        : moderationResult?.requiresManualReview
          ? 'Tu feedback ha sido publicado y está en revisión por nuestro equipo.'
          : 'Feedback publicado exitosamente.';

    return {
      message,
      feedback: savedFeedback,
      moderation: {
        isCensored: savedFeedback.isCensored,
        requiresReview: savedFeedback.requiresManualReview,
      },
    };
  }

  async hasUserFeedback(userId: string, courseId: string): Promise<boolean> {
    const existingFeedback = await this.feedbackRepo.findExistingFeedback(
      userId,
      courseId,
    );
    return !!existingFeedback;
  }

  async getAllFeedBacks() {
    const feedbacksFounds = await this.feedbackRepo.getAllFeedBacks();

    return feedbacksFounds;
  }

  // servicio para feedback
  async getCourseFeedbacks(courseId: string) {
    return await this.feedbackRepo.getCourseFeedbacks(courseId);
  }
}
