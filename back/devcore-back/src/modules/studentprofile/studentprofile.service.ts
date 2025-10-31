import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { UserRole } from "../users/enums/user-role.enum";
import { UsersRepository } from "../users/users.repository";
import { UpdateStudentProfileDto } from "./dto/UpdateStudentProfile.dto";
import { StudentProfileRepository } from "./studentprofile.repository";

export class StudentProfileService {
    constructor(
        private readonly studentProfileRepository: StudentProfileRepository,
        private readonly usersRepository: UsersRepository
    ){}

    /**
     * Metodo para crear o actualiazar el perfil del estudiante
     */
    async updateOrCreateStudentProfile(
        userId: string,
        updateDto: UpdateStudentProfileDto
    ){
        //buscamos al usuario
        const user = await this.usersRepository.findUserById(userId);

        if(!user){
            throw new NotFoundException('Usuario no encontrado');
        }

        //verificacion  si es estudiante
        if(user.role !== UserRole.STUDENT){
            throw new ForbiddenException('Solo los estudiantes pueden actualizar su perfil');
        }

        //buscamos si ya existe un perfil para este usuario
        let profile = await this.studentProfileRepository.findByUserId(userId);

        //si no existe crea uno nuevo
        if(!profile){
            profile = this.studentProfileRepository.create({
                user: user
            })
        }

        //fusionamos los datos nuevos del dto cpn el perfil sea que xista o no
        Object.assign(profile, updateDto);

        //guardamos los cambios en la db
        return this.studentProfileRepository.save(profile)
    }


     /**
      * Metodo para obtener el perfil del usuario estudiante
      */
     async getStudentProfile(userId: string){
        const profile = await this.studentProfileRepository.findByUserId(userId);
        if(!profile){
            throw new NotFoundException('Perfil de estudiante no encontrado');
        }
        return profile;
     }
}