import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

export function ApiGetCourseFeedbacksDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtiene los feedbacks de un curso específico.',
      description:
        'Devuelve todos los comentarios y valoraciones asociados al curso indicado por su ID. Los resultados están ordenados por rating (de mayor a menor).',
    }),
    ApiParam({
      name: 'courseId',
      type: 'string',
      description: 'UUID del curso del cual se desean obtener los feedbacks.',
      example: '7d7b6a14-9e88-4df2-9f30-44f9e9dbe21b',
    }),
    ApiResponse({
      status: 200,
      description: 'Feedbacks del curso obtenidos correctamente.',
      schema: {
        example: {
          statusCode: 200,
          data: [
            {
              id: 'uuid-feedback',
              courseId: 'uuid-del-curso',
              courseTitle: 'React desde Cero',
              userId: 'uuid-usuario',
              userName: 'Lucía Fernández',
              rating: 5,
              feedback: 'Excelente curso, muy claro y completo.',
              createdAt: '2025-11-10T12:00:00.000Z',
            },
            {
              id: 'uuid-feedback',
              courseId: 'uuid-del-curso',
              courseTitle: 'React desde Cero',
              userId: 'uuid-usuario',
              userName: 'Carlos Pérez',
              rating: 3,
              feedback: 'Bueno, pero podría tener más ejemplos.',
              createdAt: '2025-11-09T09:15:00.000Z',
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'No se encontraron feedbacks para el curso especificado.',
      schema: {
        example: {
          statusCode: 404,
          message: 'No se encontraron feedbacks para este curso.',
          error: 'Not Found',
        },
      },
    }),
  );
}
