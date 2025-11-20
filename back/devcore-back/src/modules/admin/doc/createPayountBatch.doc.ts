import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

export function ApiCreatePayoutBatchDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear lote de pagos para un profesor',
      description:
        'Crea un lote de pagos (batch) para un profesor específico. Agrupa todos los pagos pendientes del profesor en un único lote para facilitar el procesamiento de pagos masivos.',
    }),
    ApiParam({
      name: 'professorId',
      description: 'ID del profesor para el cual se creará el lote de pagos',
      example: '123e4567-e89b-12d3-a456-426614174000',
      type: 'string',
      format: 'uuid',
    }),
  );
}
