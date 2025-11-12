import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

export function ApiApprovedCourseDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Aprobar un curso',
      description:
        'Permite a un administrador aprobar un curso que está pendiente de revisión. Una vez aprobado, el curso estará disponible para los usuarios.',
    }),
    ApiParam({
      name: 'courseId',
      required: true,
      description: 'ID del curso que se desea aprobar',
      type: 'string',
      format: 'uuid',
      example: 'a7b8c9d0-1234-5678-90ab-cdef12345678',
    }),
    ApiResponse({
      status: 200,
      description: 'Curso aprobado correctamente',
      schema: {
        example: {
          message: 'Curso aprobado correctamente',
          course: {
            id: 'a7b8c9d0-1234-5678-90ab-cdef12345678',
            title: 'Introducción a TypeScript',
            approved: true,
            approvedAt: '2025-11-12T10:30:00.000Z',
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
