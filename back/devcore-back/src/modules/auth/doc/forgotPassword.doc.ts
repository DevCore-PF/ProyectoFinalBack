import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';

export function ApiForgotPasswordDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Solicitar recuperación de contraseña',
      description:
        'Permite al usuario solicitar un enlace de recuperación de contraseña. El sistema enviará un correo electrónico con un token único que el usuario podrá utilizar para restablecer su contraseña. No requiere autenticación.',
    }),
    ApiBody({ type: ForgotPasswordDto }),
  );
}
