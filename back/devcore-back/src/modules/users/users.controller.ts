import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  NotFoundException,
  ParseUUIDPipe,
  MaxFileSizeValidator,
  ParseFilePipe,
  FileTypeValidator,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiUpdateImageDocs } from './doc/updateImage.doc';
import { ApigetAllUsersDocs } from './doc/getAllUsers.doc';
import { ApiGetUserById } from './doc/getUserById.doc';
import { ApiDeleteUserById } from './doc/deleteUserById.doc';
import { ApiUpdateChecboxbyId } from './doc/updateChecbox.doc';
import { AuthGuard } from '@nestjs/passport';


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
  @ApiUpdateImageDocs()
  @UseInterceptors(FileInterceptor('file'))
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
  @ApigetAllUsersDocs()
  findAll() {
    return this.usersService.getAllUser();
  }

  @Get('me/purchased-courses')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obtener cursos comprados del usuario autenticado' })
  @ApiBearerAuth()
  async getMyPurchasedCourses(@Req() req) {
    const userId = req.user.sub;
    return this.usersService.getUserPurchasedCourses(userId);
}

  @Get(':id')
  @ApiGetUserById()
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
  @ApiDeleteUserById()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.deleteUser(id);
  }

  @Patch('checkbox/:id')
  @ApiUpdateChecboxbyId()
  updateCheckbox(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.updateCheckbox(id);
  }
}
