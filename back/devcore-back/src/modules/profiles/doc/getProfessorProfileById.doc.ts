import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiGetProffessorByIdDoc() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Perfil de profesor obtenido exitosamente',
      schema: {
        example: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          biography: 'Profesor con 10 años de experiencia en desarrollo web',
          specialization: 'Desarrollo Full Stack',
          experience: 10,
          certificates: [
            'https://cloudinary.com/certificate1.pdf',
            'https://cloudinary.com/certificate2.pdf',
          ],
          user: {
            id: '562129b0-9faa-45a2-bab1-4961d07b3377',
            name: 'Juan Pérez',
            email: 'juan@example.com',
            image: 'https://example.com/avatar.jpg',
          },
          courses: [
            {
              id: 'course-uuid-1',
              title: 'Curso de NestJS',
              description: 'Aprende NestJS desde cero',
            },
          ],
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-20T15:45:00Z',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Perfil de profesor no encontrado',
      schema: {
        example: {
          statusCode: 404,
          message:
            'Perfil no encontrado con id 123e4567-e89b-12d3-a456-426614174000',
          error: 'Not Found',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'ID inválido',
      schema: {
        example: {
          statusCode: 400,
          message: 'Validation failed (uuid is expected)',
          error: 'Bad Request',
        },
      },
    }),
    ApiOperation({
      summary: 'Obtener perfil de profesor por ID',
      description:
        'Devuelve la información completa del perfil de un profesor identificado por su ID. Incluye datos personales, experiencia, especialización y cursos asociados.',
    }),
  );
}
