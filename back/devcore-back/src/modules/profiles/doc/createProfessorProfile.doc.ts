import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateProfessorProfileDto } from '../dto/create-professon-profile.dto';

export function ApiCreateProfessorProfileDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: CreateProfessorProfileDto }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          phone: {
            type: 'string',
            example: '546789023',
            description: 'Número de teléfono del profesor',
          },
          profession: {
            type: 'string',
            example: 'Desarrollador FullStack',
            description: 'Profesión u ocupación principal',
          },
          speciality: {
            type: 'string',
            example: 'BackEnd',
            description: 'Especialidad o área de expertise',
          },
          biography: {
            type: 'string',
            example: 'Desarrollador con 5 años de experiencia',
            description: 'Biografía o descripción personal',
          },
          professionalLinks: {
            type: 'string',
            example:
              '["https://linkedin.com/in/usuario","https://github.com/usuario"]',
            description: 'Enlaces profesionales en formato JSON string',
          },
          agreedToTerms: {
            type: 'boolean',
            example: true,
            default: false,
            description: 'Aceptación de términos y condiciones',
          },
          agreedToInfo: {
            type: 'boolean',
            example: true,
            default: false,
            description: 'Confirmación de información verídica',
          },
          agreedToAproveed: {
            type: 'boolean',
            example: true,
            default: false,
            description: 'Aceptación de revisión de perfil',
          },
          certificates: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
            description:
              'Certificados (PDF, JPG, PNG, WEBP - máximo 10 archivos)',
          },
        },
        required: [
          'profession',
          'specialty',
          'agreedToTerms',
          'agreedToInfo',
          'agreedToAproveed',
          'certificates',
        ],
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Perfil de profesor creado exitosamente',
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
          userId: '562129b0-9faa-45a2-bab1-4961d07b3377',
          createdAt: '2024-01-15T10:30:00Z',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Archivos inválidos o datos incorrectos',
      schema: {
        example: {
          statusCode: 400,
          message: 'El archivo supera el tamaño máximo de 1MB',
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'No autenticado',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
          error: 'Unauthorized',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Usuario no encontrado',
      schema: {
        example: {
          statusCode: 404,
          message: 'Usuario no encontrado',
          error: 'Not Found',
        },
      },
    }),
    ApiOperation({
      summary: 'Crear perfil de profesor',
      description:
        'Crea un nuevo perfil de profesor en el sistema. Requiere los datos personales, profesionales y de contacto necesarios para completar la información del docente.',
    }),
  );
}
