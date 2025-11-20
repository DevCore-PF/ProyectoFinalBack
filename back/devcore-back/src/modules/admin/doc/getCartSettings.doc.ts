import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGetAbandonedCartSettingsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener configuración de carritos abandonados',
      description:
        'Retorna la configuración actual del sistema para carritos abandonados, incluyendo si la funcionalidad está habilitada y el tiempo de espera en horas antes de considerar un carrito como abandonado.',
    }),
  );
}
