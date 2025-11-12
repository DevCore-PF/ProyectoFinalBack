import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Category, CourseDifficulty } from '../entities/course.entity';

export function ApiGetAllCoursesDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los cursos con filtros y ordenamiento',
      description:
        'Devuelve una lista de todos los cursos disponibles. Permite filtrar por título, categoría, dificultad y estado (activo o inactivo), así como ordenar los resultados por distintos campos.',
    }),
    ApiQuery({
      name: 'title',
      required: false,
      type: String,
      description: 'Filtrar cursos por título (coincidencia parcial)',
      example: 'NestJS',
    }),
    ApiQuery({
      name: 'category',
      required: false,
      type: String,
      enum: Category,
      description: 'Filtrar cursos por categoría específica',
      example: 'programacion',
    }),
    ApiQuery({
      name: 'difficulty',
      required: false,
      type: String,
      enum: CourseDifficulty,
      description: 'Filtrar cursos según su nivel de dificultad',
      example: 'intermedio',
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description:
        'Campo por el cual ordenar los resultados. Valores válidos: "title", "price", "createdAt", "rating". Por defecto: "createdAt".',
      example: 'price',
    }),
    ApiQuery({
      name: 'sortOrder',
      required: false,
      type: String,
      description:
        'Dirección del ordenamiento: "asc" para ascendente o "desc" para descendente. Por defecto: "desc".',
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
              title: 'Introducción a NestJS',
              description: 'Aprende los fundamentos de NestJS desde cero.',
              category: 'programacion',
              difficulty: 'principiante',
              isActive: true,
              price: 0,
              thumbnail: 'https://example.com/thumbnail.jpg',
              lessons: [
                {
                  id: 'lesson-uuid-1',
                  title: 'Primera lección',
                  isActive: true,
                },
              ],
              professor: {
                id: 'professor-uuid',
                user: {
                  id: 'user-uuid',
                  name: 'Juan Pérez',
                  email: 'juan@example.com',
                },
              },
              feedbacks: [
                {
                  id: 'feedback-uuid',
                  rating: 5,
                  comment: 'Excelente curso',
                },
              ],
              createdAt: '2025-11-01T10:00:00.000Z',
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Parámetros de filtrado u ordenamiento inválidos.',
      schema: {
        example: {
          statusCode: 400,
          message: [
            'Categoría inválida',
            'Dificultad inválida',
            'Campo de ordenamiento inválido',
          ],
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
          message: 'Error inesperado al obtener los cursos.',
          error: 'Internal Server Error',
        },
      },
    }),
  );
}
