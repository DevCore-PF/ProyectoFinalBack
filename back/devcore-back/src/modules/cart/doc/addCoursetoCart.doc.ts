import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiAddCourseToCartDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Agregar un curso al carrito',
      description:
        'Permite agregar un curso al carrito del usuario autenticado. Si el usuario no tiene un carrito creado, se genera uno automáticamente antes de añadir el curso.',
    }),
    ApiResponse({
      status: 201,
      description: 'Curso agregado al carrito exitosamente',
      schema: {
        example: {
          message: 'Curso agregado al carrito',
          cartId: '123e4567-e89b-12d3-a456-426614174000',
          courseId: '456e7890-e89b-12d3-a456-426614174001',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'ID de curso inválido o curso ya existe en el carrito',
      schema: {
        example: {
          statusCode: 400,
          message: 'El curso ya está en el carrito',
          error: 'Bad Request',
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
  );
}
