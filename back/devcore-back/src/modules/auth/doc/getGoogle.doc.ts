import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGetGoogleDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Redirigir al inicio de sesión con Google',
      description:
        'Inicia el proceso de autenticación con Google. Redirige al usuario al servicio de Google para autorizar el acceso y continuar con el inicio de sesión mediante OAuth2.',
    }),
  );
}
