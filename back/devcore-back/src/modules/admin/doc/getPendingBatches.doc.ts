import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGetPendingBatchesDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener lotes de pagos pendientes',
      description:
        'Retorna la lista de lotes de pagos (batches) que están en estado pendiente. Útil para identificar los lotes que aún no han sido procesados o completados.',
    }),
  );
}
