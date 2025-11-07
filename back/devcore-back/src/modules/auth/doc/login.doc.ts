import { applyDecorators } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiLoginDoc() {
  return applyDecorators(
    ApiConsumes('application/x-www-form-urlencoded'),
    ApiOperation({
      summary: 'Iniciar sesión de usuario',
      description:
        'Permite a un usuario autenticarse en el sistema mediante su correo electrónico y contraseña. Devuelve un token de acceso (JWT) que debe utilizarse para acceder a los endpoints protegidos.',
    }),
    ApiResponse({
      status: 200,
      description: 'Login exitoso',
      schema: {
        example: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Juan Pérez',
            email: 'juan@example.com',
            role: 'student',
            image: 'https://example.com/avatar.jpg',
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Credenciales inválidas',
      schema: {
        example: {
          statusCode: 401,
          message: 'Email o contraseña incorrectos',
          error: 'Unauthorized',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
      schema: {
        example: {
          statusCode: 400,
          message: [
            'El email debe ser un email',
            'Password no debe estar vacio',
          ],
          error: 'Bad Request',
        },
      },
    }),
  );
}
