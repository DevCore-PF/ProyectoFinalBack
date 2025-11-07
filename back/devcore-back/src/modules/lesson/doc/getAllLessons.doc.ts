import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGetAllLessonsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todas las lecciones',
      description:
        'Devuelve una lista con todas las lecciones registradas en el sistema. Puede incluir información como título, descripción, curso asociado y estado de publicación.',
    }),
  );
}
