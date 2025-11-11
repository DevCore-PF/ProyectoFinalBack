import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

export function ApiChangeCourseVisibilityDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cambiar la visibilidad de un curso',
      description:
        'Permite alternar la visibilidad de un curso. Si el curso está visible, lo oculta; si está oculto, lo vuelve visible.',
    }),
    ApiParam({
      name: 'courseId',
      required: true,
      description: 'ID del curso cuya visibilidad se desea cambiar',
      example: 'a7b8c9d0-1234-5678-90ab-cdef12345678',
    }),
    ApiResponse({
      status: 200,
      description: 'Visibilidad del curso modificada correctamente',
      schema: {
        example: {
          message: 'Curso ocultado correctamente',
          isVisible: false,
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
