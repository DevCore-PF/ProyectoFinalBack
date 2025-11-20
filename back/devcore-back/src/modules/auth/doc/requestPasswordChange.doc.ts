import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { ChangePasswordRequestDto } from '../dto/change-password-request.dto';

export function ApiRequestPasswordChangeDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Solicitar cambio de contraseña',
      description:
        'Permite al usuario autenticado solicitar un cambio de contraseña. El usuario debe proporcionar su contraseña actual y la nueva contraseña. Se enviará un correo electrónico con un enlace de confirmación para completar el cambio de forma segura. Requiere autenticación.',
    }),
    ApiBody({ type: ChangePasswordRequestDto }),
  );
}
