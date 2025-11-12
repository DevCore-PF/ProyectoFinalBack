import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

export function ApiDeclineCourseDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Rechazar un curso',
      description:
        'Permite a un administrador rechazar un curso que está pendiente de revisión. El curso no estará disponible para los usuarios y puede requerir modificaciones antes de una nueva revisión.',
    }),
    ApiParam({
      name: 'courseId',
      required: true,
      description: 'ID del curso que se desea rechazar',
      type: 'string',
      format: 'uuid',
      example: 'a7b8c9d0-1234-5678-90ab-cdef12345678',
    }),
    ApiResponse({
      status: 200,
      description: 'Curso rechazado correctamente',
      schema: {
        example: {
          message: 'Curso rechazado correctamente',
          course: {
            id: 'a7b8c9d0-1234-5678-90ab-cdef12345678',
            title: 'Introducción a TypeScript',
            approved: false,
            declinedAt: '2025-11-12T10:30:00.000Z',
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado - Token inválido o ausente',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Acceso prohibido - Se requiere rol de administrador',
      schema: {
        example: {
          statusCode: 403,
          message: 'Forbidden resource',
          error: 'Forbidden',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Curso no encontrado',
      schema: {
        example: {
          statusCode: 404,
          message: 'Curso no encontrado',
          error: 'Not Found',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'ID de curso inválido',
      schema: {
        example: {
          statusCode: 400,
          message: 'Validation failed (uuid is expected)',
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
      schema: {
        example: {
          statusCode: 500,
          message: 'Error interno del servidor',
        },
      },
    }),
  );
}
