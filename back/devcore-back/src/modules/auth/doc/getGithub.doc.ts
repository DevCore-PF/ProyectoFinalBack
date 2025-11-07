import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiRedirectGithubDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Redirigir al inicio de sesión con GitHub',
      description:
        'Inicia el proceso de autenticación con GitHub. Redirige al usuario al servicio de GitHub para autorizar el acceso y continuar con el inicio de sesión mediante OAuth2.',
    }),
  );
}
