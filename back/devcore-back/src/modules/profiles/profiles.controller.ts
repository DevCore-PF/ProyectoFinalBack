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
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
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
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.profilesService.getProfessorById(id);
  }
}
