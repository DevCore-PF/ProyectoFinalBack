import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';

export function ApiDeclineCourseDoc() {
  return applyDecorators(
    // 👇 Cambiado para permitir textarea
    ApiConsumes('application/json'),
    ApiBearerAuth(),

    ApiOperation({
      summary: 'Rechazar un curso',
      description:
        'Permite rechazar un curso enviando un motivo del rechazo en formato string dentro de un objeto.',
    }),

    ApiParam({
      name: 'courseId',
      required: true,
      description: 'ID del curso a rechazar',
      type: 'string',
      format: 'uuid',
      example: 'a7b8c9d0-1234-5678-90ab-cdef12345678',
    }),

    ApiBody({
      description: 'Motivo del rechazo',
      required: true,
      schema: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description: 'Motivo del rechazo del curso',
            example: 'El contenido del curso es insuficiente.',
          },
        },
        required: ['reason'],
      },
    }),

    ApiResponse({
      status: 200,
      description: 'Curso rechazado correctamente',
      schema: {
        example: {
          message: 'Curso rechazado y notificación enviada',
          reason: 'El contenido del curso es insuficiente.',
        },
      },
    }),

    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Acceso prohibido' }),
    ApiResponse({ status: 404, description: 'Curso no encontrado' }),
    ApiResponse({ status: 500, description: 'Error interno del servidor' }),
  );
}
