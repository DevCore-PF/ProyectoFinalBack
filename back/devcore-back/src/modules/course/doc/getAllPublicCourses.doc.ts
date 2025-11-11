import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiGetAllPublicCourses() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los cursos públicos',
      description:
        'Retorna una lista de todos los cursos marcados como públicos. Este endpoint es de acceso libre y no requiere autenticación.',
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de cursos públicos obtenida correctamente.',
      schema: {
        example: {
          statusCode: 200,
          message: 'Cursos públicos obtenidos correctamente.',
          data: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              title: 'Introducción a NestJS',
              description: 'Aprende los fundamentos de NestJS desde cero',
              isPublic: true,
              price: 0,
              thumbnail: 'https://example.com/thumbnail.jpg',
              instructor: {
                id: 'instructor-uuid',
                name: 'Juan Pérez',
              },
              lessons: 12,
              duration: '8 horas',
              createdAt: '2025-11-01T10:00:00.000Z',
            },
            {
              id: '660e8400-e29b-41d4-a716-446655440001',
              title: 'TypeScript Avanzado',
              description: 'Domina TypeScript con conceptos avanzados',
              isPublic: true,
              price: 0,
              thumbnail: 'https://example.com/thumbnail2.jpg',
              instructor: {
                id: 'instructor-uuid-2',
                name: 'María González',
              },
              lessons: 15,
              duration: '10 horas',
              createdAt: '2025-11-05T14:30:00.000Z',
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'No se encontraron cursos públicos disponibles.',
      schema: {
        example: {
          statusCode: 404,
          message: 'No hay cursos públicos disponibles en este momento.',
          error: 'Not Found',
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor.',
      schema: {
        example: {
          statusCode: 500,
          message: 'Error inesperado al obtener los cursos públicos.',
          error: 'Internal Server Error',
        },
      },
    }),
  );
}
