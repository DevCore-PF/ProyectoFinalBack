import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiClearCart() {
  return applyDecorators(
    ApiOperation({ summary: 'Vacía todo el carrito del usuario' }),
    ApiResponse({ status: 200, description: 'Carrito vaciado correctamente' }),
  );
}
