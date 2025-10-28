import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ProfilesRepository } from "./profiles.repository";
import { UsersRepository } from "../users/users.repository";
import { AuthService } from "../auth/auth.service";
import { UserRole } from "../users/enums/user-role.enum";
import { ApprovalStatus } from "./enums/approval-status.enum";
import { CreateProfessorProfileDto } from "./dto/create-professon-profile.dto";
import { UpdateProfessorProfileDto } from "./dto/update-professor-profile.dto";

@Injectable()
export class ProfilesService {

    constructor(private readonly profilesRepository: ProfilesRepository,
        private readonly userRepository: UsersRepository,
        private readonly authService: AuthService
    ){}

    /**
     * Metodo paera crear el perfil del profesor y asi completar su perfil
     * el id del usuario viene en el token
     */
    async createProfile(userId: string, createProfileDto: CreateProfessorProfileDto){
        //primero buscamos al usuario que esta haciendo el registro de sus datos
        const user = await this.userRepository.findUserById(userId);
        if(!user){
            throw new NotFoundException('Usuario no encontrado')
        }

        //validamos que sea profesor
        if(user.role !== UserRole.TEACHER){
            throw new ForbiddenException('Solo el rol profesor puede crear este perfil')
        }

        //verificacion para validar si ya habia enviado un formulario a validacion
        if(user.hasCompletedProfile){
            throw new ConflictException('Ya has enviado tu perfil a revision')
        }

        //si pasa las validaciones creamos una instancia con los datos del dto
        const newProfile = this.profilesRepository.create({
            ...createProfileDto,
            user: user, //asignamos la relacion al usuario
            approvalStatus: ApprovalStatus.PENDING, //poemosen pendiente su estado
        })

        //guardamos el perfil nuevo en la db
        await this.profilesRepository.save(newProfile);

        //actualizamos el estado de compleyted perfil a true
        user.hasCompletedProfile = true;
        await this.userRepository.save(user)

        //genetramos el nuevo token que incluira que ah compleytado el perfil
        return this.authService.login(user)
    }

    /**
     * Metodo para actualizar un perfil de profesor
     */
    async updateProfile(userId: string, updateDto: UpdateProfessorProfileDto){
        //bucamos al usuario
        const user = await this.userRepository.findUserById(userId);
        if(!user || user.role !== UserRole.TEACHER){
            throw new ForbiddenException('Accion no permitida')
        }

        //Bucamos al perfil del profesor
        const profile = await this.profilesRepository.findByUserId(userId);
        if(!profile){
            throw new NotFoundException('Perfil no encontrado debes completarlo primero')
        }

        const sensitiveKeys: (keyof UpdateProfessorProfileDto)[] = [
            'profession', 'speciality', 'certificates'
        ];

        //reviamos si alguno de los campos que son importantes vienen en el dto del actualiazar
        const hasSesnsitiveChanges = sensitiveKeys.some(key => updateDto[key] !== undefined);

        //unimos los nuevo datos con los existentes
        Object.assign(profile, updateDto);

        //si cambio un campo imporytante resetamos el estado a pendiente
        if(hasSesnsitiveChanges){
            profile.approvalStatus = ApprovalStatus.PENDING
        }

        //Guardamos el perfil con los cambiso hechos
        return this.profilesRepository.save(profile)
    }
}