import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

export function ApiConfirmPasswordChangeDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Confirmar cambio de contraseña',
      description:
        'Valida el token de cambio de contraseña y confirma la operación. Este endpoint se accede mediante un enlace enviado al correo del usuario. Si el token es válido, confirma el cambio y redirige al login con un mensaje de éxito. Si el token es inválido o expiró, redirige al login con un mensaje de error.',
    }),
    ApiQuery({
      name: 'token',
      description: 'Token de confirmación de cambio de contraseña',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      type: 'string',
    }),
  );
}
