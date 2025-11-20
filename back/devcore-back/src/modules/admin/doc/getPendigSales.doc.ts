import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGetPendingSalesDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener historial de ventas pendientes',
      description:
        'Retorna el historial de ventas que están en estado pendiente. Útil para identificar transacciones que aún no han sido procesadas o completadas en el sistema.',
    }),
  );
}
