import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiTriggerAllRemindersDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Enviar todos los recordatorios de carritos abandonados',
      description:
        'Dispara manualmente el envío de correos electrónicos de recordatorio para todos los carritos abandonados que cumplan con los criterios configurados. Útil para pruebas o ejecuciones manuales del proceso automatizado.',
    }),
  );
}
