import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CreateCourseDto } from '../dto/create-course.dto';

export function ApiCreateCourseDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo curso asociado a un profesor',
      description:
        'Permite crear un curso y asociarlo al profesor identificado por su ID. Requiere información como el título, descripción, categoría y demás datos del curso.',
    }),
    ApiConsumes('application/x-www-form-urlencoded'),
    ApiParam({
      name: 'professorId',
      description: 'ID del profesor',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiBody({ type: CreateCourseDto }),
  );
}
