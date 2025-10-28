import { Body, Controller, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ProfilesService } from "./profiles.service";
import { AuthGuard } from "@nestjs/passport";
import { CreateProfessorProfileDto } from "./dto/create-professon-profile.dto";
import { UpdateProfessorProfileDto } from "./dto/update-professor-profile.dto";

@Controller('profiles')
export class ProfilesController {
    constructor(private readonly profilesService: ProfilesService){}

    /**
     * Ednpoint para que un profesor complete su perfil
     */
    @Post()
    @UseGuards(AuthGuard('jwt')) //se obtiene la request completa y validamos el body con el dto a pasar
    async createProfile(@Req() req, @Body() createProfileDto: CreateProfessorProfileDto){
        //Obtenemos el id del usuario desde el token
        const userId = req.user.sub;

        //ejecutamos el servicio de createprofile
        return this.profilesService.createProfile(userId, createProfileDto)
    }

    // --- PRÓXIMO PASO (CUANDO LO NECESITES) ---
  
  @Patch() // Se activa con un PATCH a /profiles
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Req() req, @Body() updateDto: UpdateProfessorProfileDto) {
    const userId = req.user.sub;
    return this.profilesService.updateProfile(userId, updateDto);
  }
  
}