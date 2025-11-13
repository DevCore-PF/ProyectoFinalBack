// src/modules/users/docs/get-user-by-role.docs.ts
import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserRole } from '../entities/user.entity';

export function ApiGetUserByRoleDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Obtener usuarios filtrados por rol' }),
    ApiQuery({
      name: 'role',
      description: 'Rol del usuario a filtrar',
      required: true,
      enum: UserRole,
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de usuarios sin la contraseña',
      type: [UserResponseDto],
    }),
  );
}
