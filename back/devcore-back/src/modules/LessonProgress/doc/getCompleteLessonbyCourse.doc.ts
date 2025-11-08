import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

export function ApiGetCompletedLessonbyCourse() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Obtener lecciones completadas',
      description:
        'Devuelve todas las lecciones completadas por el usuario en un curso específico.',
    }),
  );
}
