import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { StudentProfileService } from './studentprofile.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateStudentProfileDto } from './dto/UpdateStudentProfile.dto';
import { ApiGetStudentProfileDoc } from './doc/getStudentProfile.doc';
import { ApiUpdateStudentProfileDoc } from './doc/UpdateStudentProfile.doc';

@Controller('student-profile')
export class StudentProfileController {
  constructor(private readonly studentProfileService: StudentProfileService) {}

  /**
   * Endpoint para obtener el perfil de un estudiante
   */
  @Get()
  @ApiGetStudentProfileDoc()
  @UseGuards(AuthGuard('jwt'))
  async getStudentProfile(@Req() req) {
    const userId = req.user.id;
    return this.studentProfileService.getStudentProfile(userId);
  }

  /**
   * Ednpoint para crear o actualizar el perfil del estudiante
   */
  @Patch()
  @ApiUpdateStudentProfileDoc()
  async updateProfile(@Req() req, @Body() updateDto: UpdateStudentProfileDto) {
    const userId = req.user.id;
    return this.studentProfileService.updateOrCreateStudentProfile(
      userId,
      updateDto,
    );
  }
}
