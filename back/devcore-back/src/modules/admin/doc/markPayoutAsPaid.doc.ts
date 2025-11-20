import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';

export function ApiMarkPayoutAsPaidDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Marcar un pago como completado',
      description:
        'Marca un pago específico como pagado/completado en el sistema. Requiere proporcionar un número de referencia de la transacción para fines de auditoría y seguimiento.',
    }),
    ApiParam({
      name: 'payoutId',
      description: 'ID del pago a marcar como completado',
      example: '123e4567-e89b-12d3-a456-426614174000',
      type: 'string',
      format: 'uuid',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          referenceNumber: {
            type: 'string',
            description: 'Número de referencia de la transacción de pago',
            example: 'TXN-2024-001234',
          },
        },
        required: ['referenceNumber'],
      },
    }),
  );
}
