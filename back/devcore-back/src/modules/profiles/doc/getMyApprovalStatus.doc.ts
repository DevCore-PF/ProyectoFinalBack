import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGetMyApprovalStatusDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Consultar estado de aprobación como profesor',
      description:
        'Permite al usuario autenticado con rol de profesor consultar el estado de su solicitud de aprobación. Retorna información sobre si su solicitud está pendiente, aprobada o rechazada.',
    }),
  );
}
