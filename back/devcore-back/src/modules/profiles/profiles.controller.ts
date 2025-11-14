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
  Query,
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
import { ApiCreateProfessorProfileDoc } from './doc/createProfessorProfile.doc';
import { ApiUpdateProfessorProfile } from './doc/updateProfessorProfile.doc';
import { ApiGetProffessorByIdDoc } from './doc/getProfessorProfileById.doc';
import { Roles, RolesGuard } from '../auth/guards/verify-role.guard';
import { ApiApprovedProfessorDoc } from './doc/aprovedProfessor.doc';
import { ApiDeclineProfessorDoc } from './doc/declineProfessor.doc';
import { ApiGetProfessorsDocs } from './doc/getProfessors.doc';
import { RejectRequestDto } from './dto/reject-request.dto';

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

  /**
   * Endpoint para solicitud de cambio de rol estudiante a profesor
   */
  @Post('request-upgrade')
  @ApiCreateProfessorProfileDoc()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('certificates', 10))
  async requestTeacherRole(@Req() req, @Body() createProfileDto: CreateProfessorProfileDto, @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/i }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,){
      const userId = req.user.sub;
      return this.profilesService.requestTeacherRole(userId, createProfileDto, files)
  }

  @Get('status/my-approval')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  async getMyApprovalStatus(@Req() req) {
    const userId = req.user.sub;
    return this.profilesService.getApprovalStatusByUserId(userId);
  }
  

  @Get('profesor')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiGetProfessorsDocs()
  async getProfessors(@Query('approvalStatus') approvalStatus?: string) {
    const validStatuses = ['approved', 'pending', 'rejected'];

    const normalizedStatus = validStatuses.includes(approvalStatus ?? '')
      ? approvalStatus
      : undefined;

    return await this.profilesService.getProfessors(normalizedStatus);
  }

  /**
   * Endpoint para aprobar al usuario cambie de rol de alumno a profesor
   */
  @Patch('approved-teacher/:userId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async approvedTeacherRequest(@Param('userID', ParseUUIDPipe) userId: string){
    return this.profilesService.approvedTeacherRequest(userId);
  }

  /**
   * Endpoint para rechazar la solicitud de cambio de rol de alumno a profesor
   */
  @Patch('reject-teacher/:userId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async rejectTeacherRequest(@Param('userID', ParseUUIDPipe) userId: string, @Body() rejectDto: RejectRequestDto) {
    return this.profilesService.rejectTeacherRequest(userId, rejectDto);
  }




  @Get(':id')
  @ApiGetProffessorByIdDoc()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.profilesService.getProfessorById(id);
  }

  @Patch('aproved/:professorId')
  @ApiApprovedProfessorDoc()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async aprovedProfesor(
    @Param('professorId', ParseUUIDPipe) professorId: string,
  ) {
    return await this.profilesService.aprovedProfesor(professorId);
  }

  @Patch('decline/:professorId')
  @ApiDeclineProfessorDoc()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async declineProfesor(
    @Param('professorId', ParseUUIDPipe) professorId: string,string, @Body() rejectDto: RejectRequestDto
  ) {
    return await this.profilesService.declineProfesor(professorId, rejectDto);
  }



}
