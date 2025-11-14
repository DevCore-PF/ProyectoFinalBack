import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { CreateCourseDto } from '../dto/create-course.dto';

export function ApiCreateCourseAdminDoc() {
  return applyDecorators(
    ApiConsumes('application/x-www-form-urlencoded'),
    ApiOperation({
      summary: 'Crear un nuevo curso como administrador',
      description:
        'Permite a un administrador crear un curso en el sistema. El ID del administrador se obtiene automáticamente del token JWT. Requiere autenticación y rol de administrador.',
    }),
    ApiBearerAuth(),
    ApiBody({
      type: CreateCourseDto,
      description: 'Datos del curso a crear',
    }),
    ApiResponse({
      status: 201,
      description: 'Curso creado exitosamente',
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado - Token inválido o ausente',
    }),
    ApiResponse({
      status: 403,
      description: 'Prohibido - El usuario no tiene rol de administrador',
    }),
    ApiResponse({
      status: 400,
      description: 'Datos inválidos en el cuerpo de la petición',
    }),
  );
}
