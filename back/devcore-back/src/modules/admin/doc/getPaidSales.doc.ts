import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGetPaidSalesDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener historial de ventas pagadas',
      description:
        'Retorna el historial de ventas que ya han sido pagadas y completadas. Útil para consultar el registro de transacciones procesadas exitosamente en el sistema.',
    }),
  );
}
