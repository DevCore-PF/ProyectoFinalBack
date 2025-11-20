import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGetAllSalesDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener historial completo de ventas',
      description:
        'Retorna el historial completo de todas las ventas realizadas en el sistema, sin filtrar por estado. Incluye información detallada de cada transacción de venta.',
    }),
  );
}
