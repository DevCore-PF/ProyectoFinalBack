import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

export function ApiUpdateImageDocs() {
  return applyDecorators(
    ApiConsumes('application/x-www-form-urlencoded'),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description:
              'Foto de perfil (formatos: jpg, jpeg, png, webp, máximo 1MB)',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Imagen de perfil actualizada exitosamente',
      schema: {
        example: {
          message: 'Imagen actualizada correctamente',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Archivo inválido (formato o tamaño incorrecto)',
      schema: {
        example: {
          statusCode: 400,
          message: 'La imagen no puede superar 1 MB.',
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Usuario no encontrado o error al subir la imagen',
      schema: {
        example: {
          statusCode: 404,
          message: 'Usuario no encontrado',
          error: 'Not Found',
        },
      },
    }),
    ApiOperation({
      summary: 'Subir foto de perfil del usuario',
      description:
        'Permite subir o actualizar la imagen de perfil de un usuario específico mediante su ID. El archivo debe enviarse en formato multipart/form-data.',
    }),
  );
}
