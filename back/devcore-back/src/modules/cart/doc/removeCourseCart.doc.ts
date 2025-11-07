import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiRemoveCourseCart() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar un curso del carrito',
      description:
        'Elimina un curso específico del carrito del usuario autenticado, identificado por el ID del curso. Si el curso no está en el carrito, no se realizan cambios.',
    }),
    ApiResponse({
      status: 200,
      description: 'Curso eliminado del carrito exitosamente',
      schema: {
        example: {
          message: 'Curso eliminado del carrito',
          cartId: '123e4567-e89b-12d3-a456-426614174000',
          courseId: '456e7890-e89b-12d3-a456-426614174001',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Carrito o curso no encontrado',
      schema: {
        example: {
          statusCode: 404,
          message: 'Curso no encontrado en el carrito',
          error: 'Not Found',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'No autenticado',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
          error: 'Unauthorized',
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
  );
}
