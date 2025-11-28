import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { CreateCategoryDto } from '../dto/create-category.dto';

export function ApiCreateCategoryDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiConsumes('application/x-www-form-urlencoded'),
    ApiOperation({
      summary: 'Crear una nueva categoría',
      description:
        'Permite crear una nueva categoría en el sistema. Requiere proporcionar nombre, descripción e imagen válida.',
    }),
    ApiBearerAuth(),
    ApiBody({
      type: CreateCategoryDto,
      description: 'Datos de la categoría a crear',
      examples: {
        ejemplo1: {
          summary: 'Ejemplo: Desarrollo Web',
          value: {
            name: 'Desarrollo Web',
            description:
              'Cursos relacionados con desarrollo web, frontend y backend',
            image: 'https://ejemplo.com/images/desarrollo-web.jpg',
          },
        },
        ejemplo2: {
          summary: 'Ejemplo: Diseño UX/UI',
          value: {
            name: 'Diseño UX/UI',
            description:
              'Cursos de diseño de experiencia e interfaces de usuario',
            image: 'https://ejemplo.com/images/diseno-ux.jpg',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Categoría creada exitosamente',
      schema: {
        example: {
          id: 1,
          name: 'Desarrollo Web',
          description:
            'Cursos relacionados con desarrollo web, frontend y backend',
          image: 'https://ejemplo.com/images/desarrollo-web.jpg',
          createdAt: '2025-11-28T20:00:00.000Z',
          updatedAt: '2025-11-28T20:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Datos inválidos en el cuerpo de la petición',
      schema: {
        example: {
          statusCode: 400,
          message: [
            'name should not be empty',
            'name must be a string',
            'description should not be empty',
            'description must be a string',
            'image must be a URL address',
          ],
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado - Token inválido o ausente',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
          error: 'Unauthorized',
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Prohibido - El usuario no tiene permisos suficientes',
      schema: {
        example: {
          statusCode: 403,
          message: 'Forbidden resource',
          error: 'Forbidden',
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: 'Conflicto - La categoría ya existe',
      schema: {
        example: {
          statusCode: 409,
          message: 'Category with this name already exists',
          error: 'Conflict',
        },
      },
    }),
  );
}
