import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

export function ApiAddAditionalData() {
  return applyDecorators(
    ApiOperation({
      summary: 'Agregar datos adicionales a una lección',
      description:
        'Permite agregar información adicional a una lección existente mediante su ID. Los datos se envían como un array de strings.',
    }),
    ApiParam({
      name: 'lessonId',
      type: 'string',
      format: 'uuid',
      description:
        'ID único de la lección a la que se agregarán datos adicionales',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiBody({
      description: 'Array de strings con los datos adicionales a agregar',
      schema: {
        type: 'array',
        items: {
          type: 'string',
        },
        example: [
          'Material complementario disponible',
          'Requiere conocimientos previos de programación',
          'Duración estimada: 2 horas',
        ],
      },
    }),
    ApiResponse({
      status: 201,
      description:
        'Los datos adicionales fueron agregados correctamente a la lección.',
      schema: {
        example: {
          statusCode: 201,
          message: 'Datos adicionales agregados correctamente.',
          data: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Introducción al curso',
            aditionalData: [
              'Material complementario disponible',
              'Requiere conocimientos previos de programación',
              'Duración estimada: 2 horas',
            ],
            updatedAt: '2025-11-11T16:20:00.000Z',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description:
        'Los datos enviados no son válidos o el formato es incorrecto.',
      schema: {
        example: {
          statusCode: 400,
          message: 'El formato de los datos adicionales no es válido.',
          error: 'Bad Request',
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
          message:
            'No tienes permisos para agregar datos adicionales a esta lección.',
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
          message: 'Error inesperado al agregar los datos adicionales.',
          error: 'Internal Server Error',
        },
      },
    }),
  );
}
