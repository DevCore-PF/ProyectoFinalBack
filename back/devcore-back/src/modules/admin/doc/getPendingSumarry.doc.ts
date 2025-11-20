import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGetPendingPayoutSummaryDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener resumen de pagos pendientes',
      description:
        'Retorna un resumen de todos los pagos pendientes en el sistema. Incluye información agregada sobre los montos pendientes de pago a los profesores o usuarios.',
    }),
  );
}
