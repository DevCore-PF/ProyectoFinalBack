import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGoogleRegisterDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registro con Google',
      description:
        'Inicia el flujo de autenticación OAuth con Google para registrar un nuevo usuario. Redirige al usuario a Google para autorizar la aplicación y, tras la autorización exitosa, crea una cuenta en el sistema con los datos del perfil de Google.',
    }),
  );
}
