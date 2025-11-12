import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';

export function ApiUpdateUserProfile() {
  return applyDecorators(
    ApiConsumes('application/x-www-form-urlencoded'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Actualizar perfil de usuario',
      description:
        'Permite actualizar los datos personales del usuario autenticado. Se pueden actualizar uno o varios campos a la vez. El ID del usuario se obtiene del token JWT.',
    }),
    ApiBody({
      description:
        'Datos del perfil a actualizar (todos los campos son opcionales)',
      schema: {
        type: 'object',
        properties: {
          ciudad: {
            type: 'string',
            maxLength: 100,
            example: 'Buenos Aires',
            description: 'Ciudad de residencia del usuario',
          },
          direccion: {
            type: 'string',
            maxLength: 200,
            example: 'Av. Corrientes 1234',
            description: 'Dirección completa del usuario',
          },
          dni: {
            type: 'string',
            maxLength: 20,
            example: '12345678',
            description: 'Documento Nacional de Identidad',
          },
          telefono: {
            type: 'string',
            maxLength: 20,
            example: '+541112345678',
            description: 'Número de teléfono con código de país',
          },
          fechaNacimiento: {
            type: 'string',
            format: 'date',
            example: '1990-05-15',
            description: 'Fecha de nacimiento en formato YYYY-MM-DD',
          },
          genero: {
            type: 'string',
            enum: ['masculino', 'femenino', 'otro'],
            example: 'masculino',
            description: 'Género del usuario',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Perfil actualizado correctamente.',
      schema: {
        example: {
          statusCode: 200,
          message: 'Perfil actualizado correctamente.',
          data: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Juan Pérez',
            email: 'juan@example.com',
            ciudad: 'Buenos Aires',
            direccion: 'Av. Corrientes 1234',
            dni: '12345678',
            telefono: '+541112345678',
            fechaNacimiento: '1990-05-15',
            genero: 'masculino',
            role: 'student',
            isActive: true,
            updatedAt: '2025-11-11T18:30:00.000Z',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Datos de entrada inválidos.',
      schema: {
        example: {
          statusCode: 400,
          message: [
            'La ciudad no puede tener más de 100 caracteres',
            'El teléfono debe ser un número válido',
            'La fecha de nacimiento debe tener un formato válido (YYYY-MM-DD)',
            'El género debe ser masculino, femenino u otro',
          ],
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado. Token inválido o no proporcionado.',
      schema: {
        example: {
          statusCode: 401,
          message: 'Token inválido o expirado.',
          error: 'Unauthorized',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Usuario no encontrado.',
      schema: {
        example: {
          statusCode: 404,
          message: 'Usuario no encontrado.',
          error: 'Not Found',
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor.',
      schema: {
        example: {
          statusCode: 500,
          message: 'Error inesperado al actualizar el perfil.',
          error: 'Internal Server Error',
        },
      },
    }),
  );
}
