import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { SetPasswordDto } from '../dto/set-password.dto';

export function ApiSetPasswordDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Establecer contraseña local',
      description:
        'Permite al usuario autenticado establecer una contraseña local para su cuenta. Útil para usuarios que se registraron mediante autenticación social (Google, etc.) y desean agregar una contraseña para acceso directo. Requiere que el usuario esté autenticado.',
    }),
    ApiBody({ type: SetPasswordDto }),
  );
}
