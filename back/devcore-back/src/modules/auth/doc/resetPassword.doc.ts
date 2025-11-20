import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { ResetPasswordDto } from '../dto/reset-password.dto';

export function ApiResetPasswordDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Restablecer contraseña',
      description:
        'Permite restablecer la contraseña de un usuario utilizando un token de recuperación. Este endpoint se usa después de que el usuario solicita recuperar su contraseña y recibe un enlace con token por correo electrónico.',
    }),
    ApiBody({ type: ResetPasswordDto }),
  );
}
