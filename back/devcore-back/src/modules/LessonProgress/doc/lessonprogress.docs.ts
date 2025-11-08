import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiMarkLessonCompleteDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Marcar una lección como completada',
      description:
        'Permite a un usuario autenticado marcar una lección como completada. ' +
        'Si el progreso no existe, se crea automáticamente. Si ya existe, se actualiza a completado.',
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 201,
      description: 'La lección fue marcada como completada correctamente.',
      schema: {
        example: {
          statusCode: 201,
          message: 'Progreso registrado correctamente.',
          data: {
            id: 'uuid-del-progreso',
            user: {
              id: 'uuid-del-usuario',
              name: 'Juan Pérez',
            },
            lesson: {
              id: 'uuid-de-la-leccion',
              title: 'Introducción a NestJS',
            },
            completed: true,
            completedAt: '2025-11-07T15:32:11.000Z',
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'El usuario no está autenticado o el token es inválido.',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Usuario o lección no encontrada.',
      schema: {
        example: {
          statusCode: 404,
          message: 'Usuario o lección no encontrada',
          error: 'Not Found',
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor.',
      schema: {
        example: {
          statusCode: 500,
          message: 'Error inesperado al registrar el progreso de la lección.',
          error: 'Internal Server Error',
        },
      },
    }),
  );
}
