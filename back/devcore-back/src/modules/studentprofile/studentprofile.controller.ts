import { Body, Controller, Get, Req, UseGuards } from "@nestjs/common";
import { StudentProfileService } from "./studentprofile.service";
import { AuthGuard } from "@nestjs/passport";
import { UpdateStudentProfileDto } from "./dto/UpdateStudentProfile.dto";

@Controller('student-profile')
export class StudentProfileController {
    constructor(private readonly studentProfileService: StudentProfileService){}

    /**
     * Endpoint para obtener el perfil de un estudiante
     */
    @Get()
    @UseGuards(AuthGuard('jwt'))
    async getStudentProfile(@Req() req){
        const userId = req.user.id;
        return this.studentProfileService.getStudentProfile(userId);
    }

    /**
     * Ednpoint para crear o actualizar el perfil del estudiante
     */
    async updateProfile(@Req() req, @Body() updateDto: UpdateStudentProfileDto){
        const userId = req.user.id;
        return this.studentProfileService.updateOrCreateStudentProfile(userId, updateDto)
    }
}