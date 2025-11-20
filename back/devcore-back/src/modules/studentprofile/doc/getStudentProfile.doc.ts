import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiGetStudentProfileDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener perfil del estudiante',
      description:
        'Permite al usuario autenticado obtener su perfil de estudiante. Retorna información completa del perfil asociado al usuario autenticado.',
    }),
  );
}
