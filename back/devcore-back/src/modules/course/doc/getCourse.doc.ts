import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Category, CourseDifficulty } from '../entities/course.entity';

export function ApiGetCouseDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los cursos con filtros opcionales',
      description:
        'Devuelve una lista de todos los cursos activos en el sistema. Permite filtrar por título, categoría y dificultad. Los filtros son opcionales y se pueden combinar.',
    }),
    ApiQuery({
      name: 'title',
      required: false,
      type: String,
      description: 'Filtrar cursos por título (búsqueda parcial)',
      example: 'NestJS',
    }),
    ApiQuery({
      name: 'category',
      required: false,
      type: String,
      enum: Category, // Ajusta según tus categorías
      description: 'Filtrar cursos por categoría',
      example: 'programacion',
    }),
    ApiQuery({
      name: 'difficulty',
      required: false,
      type: String,
      enum: CourseDifficulty,
      description: 'Filtrar cursos por nivel de dificultad',
      example: 'intermedio',
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
              description: 'Aprende los fundamentos de NestJS desde cero',
              categoria: 'programacion',
              dificultad: 'principiante',
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
      description: 'Parámetros de filtrado inválidos.',
      schema: {
        example: {
          statusCode: 400,
          message: ['Categoría inválida', 'Dificultad inválida'],
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
