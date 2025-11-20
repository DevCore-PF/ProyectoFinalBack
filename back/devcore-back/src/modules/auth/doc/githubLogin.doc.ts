import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGithubLoginDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Inicio de sesión con GitHub',
      description:
        'Inicia el flujo de autenticación OAuth con GitHub para iniciar sesión. Redirige al usuario a GitHub para autorizar la aplicación y, tras la autorización exitosa, inicia sesión en el sistema si la cuenta ya existe.',
    }),
  );
}
