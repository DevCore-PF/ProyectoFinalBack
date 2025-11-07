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
import { ApiCreateProfessorProfileDoc } from './doc/createProfessorProfile.doc';
import { ApiUpdateProfessorProfile } from './doc/updateProfessorProfile.doc';
import { ApiGetProffessorByIdDoc } from './doc/getProfessorProfileById.doc';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  /**
   * Ednpoint para que un profesor complete su perfil
   */

  @Post()
  @ApiCreateProfessorProfileDoc()
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
    // const userId = '562129b0-9faa-45a2-bab1-4961d07b3377';
    const userId = req.user.sub;

    //ejecutamos el servicio de createprofile
    return this.profilesService.createProfile(userId, createProfileDto, files);
  }

  // --- PRÓXIMO PASO (CUANDO LO NECESITES) ---

  @Patch() // Se activa con un PATCH a /profiles
  @ApiUpdateProfessorProfile()
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
  @ApiGetProffessorByIdDoc()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.profilesService.getProfessorById(id);
  }
}
