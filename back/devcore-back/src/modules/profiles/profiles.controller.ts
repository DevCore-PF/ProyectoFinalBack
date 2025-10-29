import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
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

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  /**
   * Ednpoint para que un profesor complete su perfil
   */
  @Post()
  @UseGuards(AuthGuard('jwt')) //se obtiene la request completa y validamos el body con el dto a pasar
  @UseInterceptors(FilesInterceptor('certificates', 10)) //para que acepte multiples archivos
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
}
