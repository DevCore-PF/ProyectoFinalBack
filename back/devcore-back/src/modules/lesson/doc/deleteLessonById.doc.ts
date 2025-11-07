import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiDeleteLessonById() {
  return applyDecorators(
    ApiOperation({
      summary: 'Desactivar lección',
      description:
        'Marca la lección como desactivada según el ID proporcionado. Solo accesible para administradores o profesores.',
    }),
    ApiResponse({
      status: 200,
      description: 'La lección fue desactivada correctamente.',
      schema: {
        example: {
          statusCode: 200,
          message: 'Lección desactivada correctamente.',
          data: {
            id: 'uuid-leccion',
            title: 'Introducción al curso',
            isActive: false,
            updatedAt: '2025-11-07T16:20:00.000Z',
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'No se encontró la lección con el ID especificado.',
      schema: {
        example: {
          statusCode: 404,
          message: 'La lección no fue encontrada.',
          error: 'Not Found',
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'El usuario no tiene permisos para realizar esta acción.',
      schema: {
        example: {
          statusCode: 403,
          message: 'No tienes permisos para desactivar esta lección.',
          error: 'Forbidden',
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor.',
      schema: {
        example: {
          statusCode: 500,
          message: 'Error inesperado al desactivar la lección.',
          error: 'Internal Server Error',
        },
      },
    }),
  );
}
