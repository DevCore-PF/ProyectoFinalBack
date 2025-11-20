import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGetAllBatchesDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los lotes de pagos',
      description:
        'Retorna la lista completa de todos los lotes de pagos (batches) creados en el sistema, sin aplicar filtros. Incluye información de cada lote independientemente de su estado.',
    }),
  );
}
