import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

export function ApiApproveTeacherDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Aprobar solicitud de profesor',
      description:
        'Permite a un administrador aprobar la solicitud de un usuario para convertirse en profesor. Requiere proporcionar el ID del usuario. Solo accesible para usuarios con rol de administrador.',
    }),
    ApiParam({
      name: 'userId',
      description: 'ID del usuario cuya solicitud se aprobará',
      example: '123e4567-e89b-12d3-a456-426614174000',
      type: 'string',
      format: 'uuid',
    }),
  );
}
