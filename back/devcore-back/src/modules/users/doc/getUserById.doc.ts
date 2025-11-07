import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from '../dto/user-response.dto';

export function ApiGetUserById() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener un usuario por ID',
      description:
        'Devuelve la información detallada de un usuario específico identificado por su ID. Incluye datos personales, de cuenta y su estado actual.',
    }),
    ApiResponse({
      status: 200,
      description: 'Usuario encontrado exitosamente',
      type: UserResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Usuario no encontrado o inactivo',
      schema: {
        example: {
          statusCode: 404,
          message: 'Usuario no encontrado',
          error: 'Not Found',
        },
      },
    }),
  );
}
