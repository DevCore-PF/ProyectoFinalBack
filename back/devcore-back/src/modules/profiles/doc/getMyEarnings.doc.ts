import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

export function ApiGetMyEarningsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener historial de ganancias del usuario autenticado',
      description:
        'Permite al usuario autenticado consultar su historial de ganancias. Se puede filtrar por estado: pendientes (PENDING), pagadas (PAID) o todas (ALL). Por defecto retorna todas las ganancias.',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: ['PENDING', 'PAID', 'ALL'],
      description: 'Estado de las ganancias a consultar',
      example: 'ALL',
    }),
  );
}
