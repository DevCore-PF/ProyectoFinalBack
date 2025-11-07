import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from '../dto/user-response.dto';

export function ApigetAllUsersDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener lista de usuarios',
      description:
        'Devuelve una lista con todos los usuarios registrados en el sistema. Puede incluir información básica como nombre, correo electrónico, rol y estado de la cuenta.',
    }),
  );
  ApiResponse({
    status: 200,
    description: 'Lista de usuarios activos obtenida exitosamente',
    type: [UserResponseDto], // 👈 Array de usuarios
  });
}
