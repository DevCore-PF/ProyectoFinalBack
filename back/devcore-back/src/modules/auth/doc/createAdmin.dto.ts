import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { CreateUserAdminDto } from 'src/modules/users/dto/create-user-admin.dto';

export function ApiCreateAdmin() {
  return applyDecorators(
    ApiConsumes('application/x-www-form-urlencoded'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Crear un nuevo usuario administrador',
      description:
        'Endpoint protegido que permite a un administrador crear nuevos usuarios con rol de administrador. Requiere autenticación y permisos de administrador.',
    }),
    ApiBody({
      type: CreateUserAdminDto,
      description: 'Datos necesarios para crear un usuario administrador',
      examples: {
        example1: {
          summary: 'Ejemplo de creación de admin',
          value: {
            name: 'Gonzalo',
            email: 'admin@example.com',
            password: 'StrongPass123!',
            confirmPassword: 'StrongPass123!',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Usuario administrador creado exitosamente',
      schema: {
        example: {
          id: 'uuid-123',
          name: 'Gonzalo',
          email: 'admin@example.com',
          role: 'admin',
          isActive: true,
          isEmailVerified: true,
          createdAt: '2025-11-16T12:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Datos inválidos o el correo electrónico ya está en uso',
      schema: {
        example: {
          statusCode: 400,
          message: 'El correo electrónico ya está en uso',
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'No autenticado - Token inválido o no proporcionado',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'No autorizado - No tiene permisos de administrador',
      schema: {
        example: {
          statusCode: 403,
          message: 'Forbidden resource',
          error: 'Forbidden',
        },
      },
    }),
  );
}
