import { applyDecorators } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiUpdateCourseDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Permite editar un curso, total o parcialmente',
      description:
        'Devuelve el curso actualizado y lo manda directamente de vuelta a revisión.',
    }),
    ApiConsumes('application/x-www-form-urlencoded'),
    ApiResponse({
      status: 200,
      description:
        'El curso fue actualizado correctamente y enviado a revisión.',
      schema: {
        example: {
          statusCode: 200,
          message: 'Curso actualizado correctamente.',
          data: {
            id: 'uuid-del-curso',
            title: 'Nuevo título del curso',
            description: 'Descripción actualizada',
            difficulty: 'INTERMEDIATE',
            updatedAt: '2025-11-07T14:22:11.000Z',
            status: 'REVISION',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description:
        'Error en la validación de los datos enviados o curso no encontrado.',
      schema: {
        example: {
          statusCode: 400,
          message: 'El curso no existe o los datos enviados no son válidos.',
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor.',
      schema: {
        example: {
          statusCode: 500,
          message: 'Error inesperado al actualizar el curso.',
          error: 'Internal Server Error',
        },
      },
    }),
  );
}
