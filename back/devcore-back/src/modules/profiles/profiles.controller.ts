import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateProfessorProfileDto } from './dto/create-professon-profile.dto';
import { UpdateProfessorProfileDto } from './dto/update-professor-profile.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateCourseDto } from '../course/dto/create-course.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  /**
   * Ednpoint para que un profesor complete su perfil
   */
  @ApiBearerAuth()
  @Post()
  @UseGuards(AuthGuard('jwt')) //se obtiene la request completa y validamos el body con el dto a pasar
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateCourseDto })
  @UseInterceptors(FilesInterceptor('certificates', 10)) //para que acepte multiples archivos
  @ApiBody({
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
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 400,
    description: 'Archivos inválidos o datos incorrectos',
    schema: {
      example: {
        statusCode: 400,
        message: 'El archivo supera el tamaño máximo de 1MB',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuario no encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiOperation({
    summary: 'Crear perfil de profesor',
    description:
      'Crea un nuevo perfil de profesor en el sistema. Requiere los datos personales, profesionales y de contacto necesarios para completar la información del docente.',
  })
  async createProfile(
    @Req() req,
    @Body() createProfileDto: CreateProfessorProfileDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/i }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    //Obtenemos el id del usuario desde el token
    // const userId = '562129b0-9faa-45a2-bab1-4961d07b3377';
    const userId = req.user.sub;

    //ejecutamos el servicio de createprofile
    return this.profilesService.createProfile(userId, createProfileDto, files);
  }

  // --- PRÓXIMO PASO (CUANDO LO NECESITES) ---

  @Patch() // Se activa con un PATCH a /profiles
  @ApiOperation({
    summary: 'Actualizar perfil de profesor',
    description:
      'Permite modificar la información del perfil de un profesor autenticado. Se pueden actualizar datos personales, profesionales, de contacto o cualquier otro campo editable del perfil.',
  })
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('certificates', 10))
  async updateProfile(
    @Req() req,
    @Body() updateDto: UpdateProfessorProfileDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/i }),
        ],
        fileIsRequired: false,
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    const userId = req.user.sub;
    return this.profilesService.updateProfile(userId, updateDto, files);
  }

  @Get(':id')
  @ApiResponse({
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
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed (uuid is expected)',
        error: 'Bad Request',
      },
    },
  })
  @ApiOperation({
    summary: 'Obtener perfil de profesor por ID',
    description:
      'Devuelve la información completa del perfil de un profesor identificado por su ID. Incluye datos personales, experiencia, especialización y cursos asociados.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.profilesService.getProfessorById(id);
  }
}
