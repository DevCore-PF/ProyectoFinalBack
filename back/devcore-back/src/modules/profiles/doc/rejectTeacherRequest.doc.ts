import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { RejectRequestDto } from '../dto/reject-request.dto';

export function ApiRejectTeacherDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Rechazar solicitud de profesor',
      description:
        'Permite a un administrador rechazar la solicitud de un usuario para convertirse en profesor. Requiere proporcionar el ID del usuario y la información de rechazo. Solo accesible para usuarios con rol de administrador.',
    }),
    ApiParam({
      name: 'userId',
      description: 'ID del usuario cuya solicitud se rechazará',
      example: '123e4567-e89b-12d3-a456-426614174000',
      type: 'string',
      format: 'uuid',
    }),
    ApiBody({ type: RejectRequestDto }),
  );
}
