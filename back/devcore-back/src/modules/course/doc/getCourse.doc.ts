import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

export function ApiGetCouseDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los cursos o filtrar por título',
      description:
        'Devuelve una lista de todos los cursos disponibles en el sistema. Si se proporciona el parámetro opcional "title", filtra los cursos cuyo título coincida total o parcialmente con el valor indicado.',
    }),
    ApiQuery({ name: 'title', required: false, type: String }),
  );
}
