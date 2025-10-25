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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    await this.usersService.create(createUserDto);

    const { password, confirmPassword, ...userExceptionPassword } =
      createUserDto;

    return userExceptionPassword;
  }

  // @ApiBearerAuth()
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
            'Foto de perfil (formatos: jpg, jpeg, png, webp, máximo 200KB)',
        },
      },
    },
  })
  async uploadProfilePicture(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
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
      throw new NotFoundException('Error al subir la imagen a Cloudinary');
    }

    return this.usersService.updateUserImage(id, result.secure_url);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
