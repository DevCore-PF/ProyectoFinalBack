import { applyDecorators } from '@nestjs/common';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';

export function ApiSlectRoleDoct() {
  return applyDecorators(
    ApiConsumes('application/x-www-form-urlencoded'),
    ApiOperation({
      summary: 'Seleccionar el rol de un usuario',
      description:
        'Permite asignar o actualizar el rol de un usuario autenticado (por ejemplo, estudiante o profesor). Este endpoint se utiliza generalmente después del registro o durante la configuración inicial del perfil.',
    }),
  );
}
