import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

export function ApiHasUserFeedbackDocs() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Verifica si el usuario autenticado ya dejó feedback en un curso.',
      description:
        'Este endpoint permite saber si el usuario logueado ya dejó una valoración o comentario sobre el curso indicado. Requiere autenticación JWT.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'courseId',
      type: 'string',
      description: 'UUID del curso que se desea verificar.',
      example: '7d7b6a14-9e88-4df2-9f30-44f9e9dbe21b',
    }),
    ApiResponse({
      status: 200,
      description:
        'Devuelve true si el usuario ya dejó feedback, o false si aún no lo hizo.',
      schema: {
        example: {
          statusCode: 200,
          data: {
            hasFeedback: true,
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Token JWT faltante o inválido.',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
          error: 'No autorizado.',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'El curso no fue encontrado.',
      schema: {
        example: {
          statusCode: 404,
          message: 'Curso no encontrado.',
          error: 'Not Found',
        },
      },
    }),
  );
}
