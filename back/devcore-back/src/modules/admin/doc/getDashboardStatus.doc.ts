import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGetAbandonedCartDashboardDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener estadísticas del dashboard de carritos abandonados',
      description:
        'Retorna información completa del dashboard de carritos abandonados, incluyendo: estado de la funcionalidad (habilitada/deshabilitada), frecuencia de envío de recordatorios, cantidad de carritos pendientes de envío, y fecha de la última ejecución del proceso de envío de emails.',
    }),
  );
}
