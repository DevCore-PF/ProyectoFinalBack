import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGetPaidBatchesDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener lotes de pagos completados',
      description:
        'Retorna la lista de lotes de pagos (batches) que ya han sido pagados y completados. Útil para consultar el historial de lotes procesados exitosamente.',
    }),
  );
}
