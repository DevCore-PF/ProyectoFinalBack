import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

export function ApiDeclineProfessorDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Rechazar un profesor',
      description:
        'Permite a un administrador rechazar la solicitud de un profesor. El usuario no obtendrá permisos para crear cursos y puede necesitar corregir información antes de una nueva solicitud.',
    }),
    ApiParam({
      name: 'profesorId',
      required: true,
      description: 'ID del profesor que se desea rechazar',
      type: 'string',
      format: 'uuid',
      example: 'b8c9d0e1-2345-6789-01bc-def123456789',
    }),
    ApiResponse({
      status: 200,
      description: 'Profesor rechazado correctamente',
      schema: {
        example: {
          message: 'Profesor rechazado correctamente',
          professor: {
            id: 'b8c9d0e1-2345-6789-01bc-def123456789',
            name: 'Juan Pérez',
            email: 'juan.perez@example.com',
            approved: false,
            declinedAt: '2025-11-12T10:30:00.000Z',
            role: 'user',
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
      description: 'Profesor no encontrado',
      schema: {
        example: {
          statusCode: 404,
          message: 'Profesor no encontrado',
          error: 'Not Found',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'ID de profesor inválido',
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
