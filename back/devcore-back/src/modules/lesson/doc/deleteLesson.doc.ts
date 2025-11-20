import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

export function ApiDeleteLessonDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar una lección',
      description:
        'Permite eliminar una lección específica identificada por su ID. La lección será eliminada permanentemente del sistema.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID de la lección a eliminar',
      example: '123e4567-e89b-12d3-a456-426614174000',
      type: 'string',
      format: 'uuid',
    }),
  );
}
