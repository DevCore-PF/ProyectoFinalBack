import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from '../dto/user-response.dto';

export function ApigetAllActiveUsersDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Obtener lista de usuarios activos',
      description:
        'Devuelve una lista con todos los usuarios que tienen estado activo en el sistema.',
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de usuarios activos obtenida exitosamente',
      type: [UserResponseDto],
    }),
  );
}
