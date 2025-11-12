import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Category, CourseDifficulty } from '../entities/course.entity';

export function ApiGetAllCoursesAdminDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los cursos (solo administradores)',
      description:
        'Devuelve una lista completa de cursos, incluyendo tanto activos como inactivos. Permite filtrar por título, categoría, dificultad y estado, así como ordenar los resultados por distintos criterios. Solo accesible para usuarios con rol **admin**.',
    }),
    ApiBearerAuth(),
    ApiQuery({
      name: 'title',
      required: false,
      type: String,
      description: 'Filtrar cursos por coincidencia parcial en el título.',
      example: 'NestJS',
    }),
    ApiQuery({
      name: 'category',
      required: false,
      type: String,
      enum: Category,
      description: 'Filtrar cursos por categoría específica.',
      example: 'programacion',
    }),
    ApiQuery({
      name: 'difficulty',
      required: false,
      type: String,
      enum: CourseDifficulty,
      description: 'Filtrar cursos por nivel de dificultad.',
      example: 'avanzado',
    }),
    ApiQuery({
      name: 'isActive',
      required: false,
      type: String,
      description:
        'Filtrar por estado del curso. Valores válidos: `"true"` para activos o `"false"` para inactivos. Si no se especifica, se devuelven todos.',
      example: 'false',
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description:
        'Campo por el cual ordenar los resultados. Valores válidos: `"title"`, `"price"`, `"createdAt"`, `"rating"`. Por defecto: `"createdAt"`.',
      example: 'title',
    }),
    ApiQuery({
      name: 'sortOrder',
      required: false,
      type: String,
      description:
        'Dirección del ordenamiento: `"asc"` para ascendente o `"desc"` para descendente. Por defecto: `"desc"`.',
      example: 'asc',
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de cursos obtenida correctamente.',
      schema: {
        example: {
          statusCode: 200,
          message: 'Cursos obtenidos correctamente.',
          data: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              title: 'Curso Avanzado de NestJS',
              description: 'Domina NestJS creando APIs robustas y escalables.',
              category: 'programacion',
              difficulty: 'avanzado',
              isActive: false,
              price: 120,
              thumbnail: 'https://example.com/nest-course.png',
              lessons: [
                {
                  id: 'lesson-uuid-1',
                  title: 'Introducción avanzada',
                  isActive: true,
                },
              ],
              professor: {
                id: 'professor-uuid',
                user: {
                  id: 'user-uuid',
                  name: 'Carlos López',
                  email: 'carlos@example.com',
                },
              },
              feedbacks: [
                {
                  id: 'feedback-uuid',
                  rating: 4,
                  comment: 'Muy completo, aunque algo complejo al principio.',
                },
              ],
              createdAt: '2025-10-25T14:30:00.000Z',
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado. El usuario no posee un token JWT válido.',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Acceso denegado. El usuario no tiene rol de administrador.',
      schema: {
        example: {
          statusCode: 403,
          message: 'Forbidden resource',
          error: 'Forbidden',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Parámetros de filtrado u ordenamiento inválidos.',
      schema: {
        example: {
          statusCode: 400,
          message: ['Categoría inválida', 'Campo sortBy inválido'],
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor.',
      schema: {
        example: {
          statusCode: 500,
          message: 'Error inesperado al obtener los cursos para admin.',
          error: 'Internal Server Error',
        },
      },
    }),
  );
}
