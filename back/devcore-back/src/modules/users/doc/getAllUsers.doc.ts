import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UserResponseDto } from '../dto/user-response.dto';

export function ApigetAllUsersDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener lista de usuarios',
      description:
        'Devuelve una lista con todos los usuarios registrados en el sistema. ' +
        'Se pueden filtrar opcionalmente por estado activo o por rol.',
    }),
    ApiQuery({
      name: 'isActive',
      required: false,
      description: 'Filtra usuarios activos o inactivos (true/false)',
      type: String,
      enum: ['true', 'false'],
    }),
    ApiQuery({
      name: 'role',
      required: false,
      description: 'Filtra por rol de usuario',
      type: String,
      enum: ['admin', 'teacher', 'student'],
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de usuarios obtenida exitosamente',
      type: [UserResponseDto],
    }),
  );
}
