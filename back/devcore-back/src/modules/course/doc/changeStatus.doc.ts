import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

export function ApiChangeStatusCourseDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Activar o desactivar un curso',
      description:
        'Cambia el estado de activación de un curso. Si el curso está activo, lo desactiva; si está inactivo, lo activa.',
    }),
    ApiParam({
      name: 'courseId',
      required: true,
      description: 'ID del curso que se desea activar o desactivar',
      example: 'd3f8b68a-3b73-4f2a-8b4a-6a5e3cf8c9c1',
    }),
    ApiResponse({
      status: 200,
      description: 'Estado del curso modificado correctamente',
      schema: {
        example: 'Curso activado correctamente',
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
