import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from '../dto/user-response.dto';

export function ApigetAllInactiveUsersDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener lista de usuarios inactivos',
      description:
        'Devuelve una lista con todos los usuarios que tienen estado inactivo en el sistema.',
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de usuarios inactivos obtenida exitosamente',
      type: [UserResponseDto],
    }),
  );
}