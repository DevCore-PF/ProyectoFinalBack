import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGoogleLoginDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Inicio de sesión con Google',
      description:
        'Inicia el flujo de autenticación OAuth con Google para iniciar sesión. Redirige al usuario a Google para autorizar la aplicación y, tras la autorización exitosa, inicia sesión en el sistema si la cuenta ya existe.',
    }),
  );
}
