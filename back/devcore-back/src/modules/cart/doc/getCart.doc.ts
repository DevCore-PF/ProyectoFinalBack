import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiGetCartDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener el carrito del usuario',
      description:
        'Devuelve el carrito actual del usuario autenticado. Si el usuario no tiene un carrito existente, se crea uno nuevo automáticamente.',
    }),
    ApiResponse({
      status: 200,
      description: 'Carrito obtenido o creado exitosamente.',
      schema: {
        example: {
          id: 'a3b5f9c0-1234-4bcd-9876-abcdef123456',
          userId: 'c1d2e3f4-5678-9876-abcd-123456789abc',
          items: [
            {
              courseId: 'd7e8f9a0-1122-3344-5566-778899aabbcc',
              title: 'Curso de Node.js avanzado',
              price: 199.99,
            },
          ],
          total: 199.99,
          createdAt: '2025-11-03T18:20:30.000Z',
          updatedAt: '2025-11-03T18:25:10.000Z',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado. Token no válido o ausente.',
    }),
    ApiResponse({ status: 500, description: 'Error interno del servidor.' }),
  );
}
