import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiRedirectHomeGithubDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Redirección después del inicio de sesión con GitHub',
      description:
        'Endpoint de callback utilizado por GitHub tras una autenticación exitosa. Procesa la información del usuario proporcionada por GitHub y genera el token de acceso (JWT) correspondiente para iniciar sesión en el sistema.',
    }),
  );
}
