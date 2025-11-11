import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiGetAllFeedbacksDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtiene todos los feedbacks de todos los cursos.',
      description:
        'Devuelve una lista con todos los comentarios y valoraciones de los cursos, ordenados de mayor a menor rating. Solo accesible para administradores.',
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de feedbacks obtenida correctamente.',
      schema: {
        example: {
          statusCode: 200,
          data: [
            {
              id: 'uuid-feedback',
              courseId: 'uuid-curso',
              courseTitle: 'Introducción a NestJS',
              userId: 'uuid-usuario',
              userName: 'Juan Pérez',
              rating: 5,
              feedback: 'Excelente curso, muy completo.',
              createdAt: '2025-11-07T15:50:00.000Z',
            },
            {
              id: 'uuid-feedback',
              courseId: 'uuid-curso',
              courseTitle: 'JavaScript Avanzado',
              userId: 'uuid-usuario',
              userName: 'María Gómez',
              rating: 4,
              feedback: 'Muy bueno, pero le faltaron ejemplos prácticos.',
              createdAt: '2025-11-06T18:30:00.000Z',
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'No hay feedbacks registrados.',
      schema: {
        example: {
          statusCode: 404,
          message: 'No se encontraron feedbacks.',
          error: 'Not Found',
        },
      },
    }),
  );
}
