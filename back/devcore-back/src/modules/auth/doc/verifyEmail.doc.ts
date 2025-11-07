import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiVerifyEmailDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Verificar correo electrónico del usuario',
      description:
        'Verifica la dirección de correo electrónico de un usuario mediante un token enviado por email. Este endpoint completa el proceso de validación de cuenta para permitir el acceso al sistema.',
    }),
  );
}
