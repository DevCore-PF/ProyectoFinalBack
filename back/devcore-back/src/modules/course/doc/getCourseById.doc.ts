import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGetCourseByIdDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener un curso por ID con sus relaciones',
      description:
        'Devuelve la información completa de un curso identificado por su ID, incluyendo sus relaciones con el profesor, las lecciones y demás datos asociados.',
    }),
  );
}
