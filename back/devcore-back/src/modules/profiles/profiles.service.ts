import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProfilesRepository } from './profiles.repository';
import { UsersRepository } from '../users/users.repository';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../users/enums/user-role.enum';
import { ApprovalStatus } from './enums/approval-status.enum';
import { CreateProfessorProfileDto } from './dto/create-professon-profile.dto';
import { UpdateProfessorProfileDto } from './dto/update-professor-profile.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly profilesRepository: ProfilesRepository,
    private readonly userRepository: UsersRepository,
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  /**
   * Metodo paera crear el perfil del profesor y asi completar su perfil
   * el id del usuario viene en el token
   */
  async createProfile(
    userId: string,
    createProfileDto: CreateProfessorProfileDto,
    files: Array<Express.Multer.File>
  ) {
    //primero buscamos al usuario que esta haciendo el registro de sus datos
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    //validamos que sea profesor
    if (user.role !== UserRole.TEACHER) {
      throw new ForbiddenException(
        'Solo el rol profesor puede crear este perfil',
      );
    }

    //verificacion para validar si ya habia enviado un formulario a validacion
    if (user.hasCompletedProfile) {
      throw new ConflictException('Ya has enviado tu perfil a revision');
    }

    if (!createProfileDto.agreedToTerms) {
      throw new ConflictException(
        'Debes aceptar los terminos y condiciones de instructor',
      );
    }

    if(!user.isEmailVerified) {
        throw new ConflictException('Debe verificar su email para poder completar su perfil')
    }

    if (!createProfileDto.agreedToInfo) {
      throw new ConflictException(
        'Debes aceptar que la informacion poporcionada es veridica',
      );
    }

    if (!createProfileDto.agreedToAproveed) {
      throw new ConflictException(
        'Debes aceptar que tu solicitud estara a revision',
      );
    }

    //creamos un arreglo para los certificados
    let certificateUrls: string[] = [];
    if(files && files.length > 0){
      const uploadPromises = files.map(file => this.cloudinaryService.uploadCertificate(file));
      const results = await Promise.all(uploadPromises);
      // Filtramos por si alguno falló y obtén solo las Uque si se subieron
      certificateUrls = results.filter(result => result?.secure_url).map(result => result!.secure_url)
    }

    //si pasa las validaciones creamos una instancia con los datos del dto
    const newProfile = this.profilesRepository.create({
      ...createProfileDto,
      user: user, //asignamos la relacion al usuario
      approvalStatus: ApprovalStatus.PENDING, //poemosen pendiente su estado
      certificates: certificateUrls //le pasamos las url de cloudinary
    });

    //guardamos el perfil nuevo en la db
    await this.profilesRepository.save(newProfile);

    //actualizamos el estado de compleyted perfil a true
    user.hasCompletedProfile = true;
    await this.userRepository.save(user);

    // 4. --- ¡EL CAMBIO! ---
    // En lugar de pasar el 'user' viejo, vuelve a buscarlo
    // a la BD para obtener el usuario COMPLETO (con el perfil).
    const updatedUserWithProfile =
      await this.userRepository.findUserWithProfile(userId);

    // 5. Pasa el usuario completo al login
    return this.authService.login(updatedUserWithProfile);
  }

  /**
   * Metodo para actualizar un perfil de profesor
   */
  async updateProfile(userId: string, updateDto: UpdateProfessorProfileDto, files: Array<Express.Multer.File>) {
    //bucamos al usuario
    const user = await this.userRepository.findUserById(userId);
    if (!user || user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Accion no permitida');
    }

    //Bucamos al perfil del profesor
    const profile = await this.profilesRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException(
        'Perfil no encontrado debes completarlo primero',
      );
    }

    const sensitiveKeys: (keyof UpdateProfessorProfileDto)[] = [
      'profession',
      'speciality',
    ];

    //reviamos si alguno de los campos que son importantes vienen en el dto del actualiazar
    const hasSesnsitiveChanges = sensitiveKeys.some(
      (key) => updateDto[key] !== undefined,
    );

    //unimos los nuevo datos con los existentes
    Object.assign(profile, updateDto);

    let hasNewFiles = false;
    if(files && files.length > 0){
      hasNewFiles = true;

      //Subimos los nuevo archivos a cloudinary
      const uploadPromises = files.map(file => this.cloudinaryService.uploadCertificate(file)) //Llamamos al metodo para subir los archivos

      const results = await Promise.all(uploadPromises);
      const newUrls = results.filter(result => result?.secure_url).map(result => result!.secure_url);

      //Añadimos las nuevas urls al arreglo de cetificates
      if(!profile.certificates){
        profile.certificates = []
      }

      profile.certificates.push(...newUrls)
    }

    //si cambio un campo imporytante resetamos el estado a pendiente
    if (hasSesnsitiveChanges || hasNewFiles) {
      profile.approvalStatus = ApprovalStatus.PENDING;
    }

    //Guardamos el perfil con los cambiso hechos
    return this.profilesRepository.save(profile);
  }
}
