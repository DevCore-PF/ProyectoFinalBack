import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGetLessonByIdDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener una lección por ID',
      description:
        'Devuelve la información detallada de una lección específica identificada por su ID. Incluye datos como título, contenido, duración y curso al que pertenece.',
    }),
  );
}
