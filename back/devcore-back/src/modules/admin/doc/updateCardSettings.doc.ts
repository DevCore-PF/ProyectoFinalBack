import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { UpdateCartSettingsDto } from '../dto/update-cart-settings.dto';

export function ApiUpdateAbandonedCartSettingsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar configuración de carritos abandonados',
      description:
        'Permite actualizar la configuración del sistema para carritos abandonados. Se puede modificar si la funcionalidad está habilitada y/o el tiempo de espera en horas. Los campos son opcionales, solo se actualizarán los valores enviados.',
    }),
    ApiBody({ type: UpdateCartSettingsDto }),
  );
}
