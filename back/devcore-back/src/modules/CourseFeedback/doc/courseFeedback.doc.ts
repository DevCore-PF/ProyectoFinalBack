import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

export function ApiCreateCourseFeedbackDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Permite dejar una valoración y comentario sobre un curso.',
      description:
        'Solo los usuarios que compraron el curso pueden dejar feedback. Devuelve el feedback creado.',
    }),
    ApiBearerAuth(),
    ApiConsumes('application/x-www-form-urlencoded'),
    ApiResponse({
      status: 201,
      description: 'Feedback creado correctamente.',
      schema: {
        example: {
          statusCode: 201,
          message: 'Feedback guardado con éxito.',
          data: {
            id: 'uuid-feedback',
            courseId: 'uuid-curso',
            userId: 'uuid-usuario',
            rating: 5,
            feedback: 'Excelente curso, aprendí mucho.',
            createdAt: '2025-11-07T15:50:00.000Z',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'El usuario no está inscripto o ya dejó un feedback.',
      schema: {
        example: {
          statusCode: 400,
          message: 'Ya dejaste una valoración para este curso.',
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Usuario o curso no encontrado.',
      schema: {
        example: {
          statusCode: 404,
          message: 'Usuario o curso no encontrado.',
          error: 'Not Found',
        },
      },
    }),
  );
}
