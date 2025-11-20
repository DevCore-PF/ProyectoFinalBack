import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGetMyPaymentsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener mis pagos realizados',
      description:
        'Permite al usuario autenticado consultar el historial de todos los pagos que ha realizado en la plataforma. Retorna información detallada de cada transacción de pago asociada al usuario.',
    }),
  );
}
