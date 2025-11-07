import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function apiRedirectGoogleDoct() {
  return applyDecorators(
    ApiOperation({
      summary: 'Redirección después del inicio de sesión con Google',
      description:
        'Endpoint de callback utilizado por Google tras la autenticación exitosa. Procesa la información del usuario proporcionada por Google y genera el token de acceso (JWT) correspondiente para iniciar sesión en el sistema.',
    }),
  );
}
