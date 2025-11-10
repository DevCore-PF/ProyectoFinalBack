import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from '../dto/user-response.dto';

export function ApigetAllUsersDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener lista de todos los usuarios',
      description:
        'Devuelve una lista completa con todos los usuarios registrados en el sistema, sin importar si están activos o inactivos.',
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de todos los usuarios obtenida exitosamente',
      type: [UserResponseDto],
    }),
  );
}
