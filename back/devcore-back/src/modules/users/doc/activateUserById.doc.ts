import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserResponseDto } from '../dto/user-response.dto';

export function ApiActivateUserDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Activar un usuario desactivado',
      description:
        'Busca un usuario que esté desactivado y lo activa. ' +
        'Si el usuario ya está activo o no existe, devuelve un error.',
    }),
    ApiParam({
      name: 'userId',
      description: 'ID del usuario a activar (UUID)',
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: 'Usuario activado correctamente',
      type: UserResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'No se encontró un usuario inactivo con ese ID',
    }),
  );
}
