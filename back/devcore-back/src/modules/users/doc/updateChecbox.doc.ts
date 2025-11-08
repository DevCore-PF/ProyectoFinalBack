import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiUpdateChecboxbyId() {
  return applyDecorators(
    ApiOperation({
      summary: 'Activar el campo checkbox de un usuario',
      description:
        'Actualiza el campo "checkbox" del usuario identificado por su ID, asignándole el valor true. Se utiliza para marcar una confirmación o estado específico dentro del perfil del usuario.',
    }),
    ApiResponse({
      status: 200,
      description: 'Términos y condiciones aceptados exitosamente',
      schema: {
        example: {
          checkBoxTerms: true,
          message: 'Términos y condiciones aceptados',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Usuario no encontrado',
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
