import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

export function ApiHasUserFeedbackDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Verificar si el usuario ha dejado feedback en un curso',
      description:
        'Permite al usuario autenticado verificar si ya ha dejado feedback/reseña en un curso específico. Retorna un booleano indicando si el usuario tiene feedback registrado para el curso.',
    }),
    ApiParam({
      name: 'courseId',
      description: 'ID del curso a verificar',
      example: '123e4567-e89b-12d3-a456-426614174000',
      type: 'string',
    }),
  );
}
