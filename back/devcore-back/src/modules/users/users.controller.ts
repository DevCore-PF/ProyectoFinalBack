import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
  ParseUUIDPipe,
  MaxFileSizeValidator,
  ParseFilePipe,
  FileTypeValidator,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  // @ApiConsumes('application/x-www-form-urlencoded')
  // @Post()
  // async create(@Body() createUserDto: CreateUserDto) {
  //   await this.usersService.create(createUserDto);

  //   const { password, confirmPassword, ...userExceptionPassword } =
  //     createUserDto;

  //   return userExceptionPassword;
  // }

  // @ApiBearerAuth()
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post(':id/upload/profile')
  // @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Foto de perfil (formatos: jpg, jpeg, png, webp, máximo 1MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Imagen de perfil actualizada exitosamente',
    schema: {
      example: {
        message: 'Imagen actualizada correctamente',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo inválido (formato o tamaño incorrecto)',
    schema: {
      example: {
        statusCode: 400,
        message: 'La imagen no puede superar 1 MB.',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado o error al subir la imagen',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuario no encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiOperation({
    summary: 'Subir foto de perfil del usuario',
    description:
      'Permite subir o actualizar la imagen de perfil de un usuario específico mediante su ID. El archivo debe enviarse en formato multipart/form-data.',
  })
  async uploadProfilePicture(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024,
            message: 'La imagen no puede superar 1 MB.',
          }),
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|webp)$/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.cloudinaryService.uploadImage(file);
    if (!result?.secure_url) {
      throw new NotFoundException('Error al subir la imagen');
    }

    return this.usersService.updateUserImage(id, result.secure_url);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener lista de usuarios',
    description:
      'Devuelve una lista con todos los usuarios registrados en el sistema. Puede incluir información básica como nombre, correo electrónico, rol y estado de la cuenta.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios activos obtenida exitosamente',
    type: [UserResponseDto], // 👈 Array de usuarios
  })
  findAll() {
    return this.usersService.getAllUser();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un usuario por ID',
    description:
      'Devuelve la información detallada de un usuario específico identificado por su ID. Incluye datos personales, de cuenta y su estado actual.',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado o inactivo',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuario no encontrado',
        error: 'Not Found',
      },
    },
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getUserById(id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Body() updateUserDto: UpdateUserDto,
  // ) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  @Delete(':id')
  @ApiOperation({
    summary: 'Desactivar un usuario por ID',
    description:
      'Desactiva la cuenta de un usuario identificado por su ID sin eliminarlo de la base de datos. El usuario permanecerá registrado pero no podrá acceder al sistema hasta ser reactivado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario desactivado exitosamente',
    schema: {
      type: 'object',
      properties: {
        isActive: {
          type: 'boolean',
          example: false,
          description: 'Estado del usuario después de la desactivación',
        },
        message: {
          type: 'string',
          example: 'Usuario desactivado correctamente',
          description: 'Mensaje de confirmación',
        },
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
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.deleteUser(id);
  }

  @Patch('checkbox/:id')
  @ApiOperation({
    summary: 'Activar el campo checkbox de un usuario',
    description:
      'Actualiza el campo "checkbox" del usuario identificado por su ID, asignándole el valor true. Se utiliza para marcar una confirmación o estado específico dentro del perfil del usuario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Términos y condiciones aceptados exitosamente',
    schema: {
      example: {
        checkBoxTerms: true,
        message: 'Términos y condiciones aceptados',
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
  updateCheckbox(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.updateCheckbox(id);
  }
}
