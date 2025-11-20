import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGithubRegisterDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registro con GitHub',
      description:
        'Inicia el flujo de autenticación OAuth con GitHub para registrar un nuevo usuario. Redirige al usuario a GitHub para autorizar la aplicación y, tras la autorización exitosa, crea una cuenta en el sistema con los datos del perfil de GitHub.',
    }),
  );
}
