import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiDeleteUserById() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Desactivar un usuario por ID',
      description:
        'Desactiva la cuenta de un usuario identificado por su ID sin eliminarlo de la base de datos. El usuario permanecerá registrado pero no podrá acceder al sistema hasta ser reactivado.',
    }),
    ApiResponse({
      status: 200,
      description: 'Usuario desactivado exitosamente',
      schema: {
        type: 'object',
        properties: {
          isActive: {
            type: 'boolean',
            example: false,
            description: 'Estado del usuario después de la desactivación',
          },
          message: {
            type: 'string',
            example: 'Usuario desactivado correctamente',
            description: 'Mensaje de confirmación',
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Usuario no encontrado',
      schema: {
        example: {
          statusCode: 404,
          message: 'Usuario no encontrado',
          error: 'Not Found',
        },
      },
    }),
  );
}
