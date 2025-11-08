import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiUpdateProfessorProfile() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar perfil de profesor',
      description:
        'Permite modificar la información del perfil de un profesor autenticado. Se pueden actualizar datos personales, profesionales, de contacto o cualquier otro campo editable del perfil.',
    }),
  );
}
