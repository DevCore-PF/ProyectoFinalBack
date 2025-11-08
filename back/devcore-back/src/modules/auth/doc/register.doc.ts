import { applyDecorators } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiRegisterDoc() {
  return applyDecorators(
    ApiConsumes('application/x-www-form-urlencoded'),
    ApiOperation({
      summary: 'Registrar un nuevo usuario',
      description:
        'Crea una nueva cuenta de usuario en el sistema. Requiere datos básicos como nombre, correo electrónico y contraseña. Devuelve la información del usuario registrado o un token de autenticación si el registro es exitoso.',
    }),

    ApiResponse({
      status: 201,
      description: 'Usuario registrado exitosamente',
      schema: {
        example: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Juan Pérez',
          email: 'juan@example.com',
          role: 'student',
          isActive: true,
          isEmailVerified: false,
          hasCompletedProfile: false,
          createdAt: '2024-01-15T10:30:00Z',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Datos inválidos o email ya registrado',
      schema: {
        example: {
          statusCode: 400,
          message: ['El email debe ser un email', 'La contraseña es muy debil'],
          error: 'Bad Request',
        },
      },
    }),
  );
}
