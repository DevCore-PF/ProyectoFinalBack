import {
  BadRequestException,
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
import { Not } from 'typeorm/browser';
import { MailService } from 'src/mail/mail.service';
import { RejectRequestDto } from './dto/reject-request.dto';
import { EnrollmentRepository } from '../enrollments/enrollments.repository';

@Injectable()
export class ProfilesService {
  

  constructor(
    private readonly profilesRepository: ProfilesRepository,
    private readonly userRepository: UsersRepository,
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly mailService: MailService,
    private readonly enrollmentRespository: EnrollmentRepository
  ) {}

  /**
   * Metodo paera crear el perfil del profesor y asi completar su perfil
   * el id del usuario viene en el token
   */
  async createProfile(
    userId: string,
    createProfileDto: CreateProfessorProfileDto,
    files: Array<Express.Multer.File>,
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

    if (!user.isEmailVerified) {
      throw new ConflictException(
        'Debe verificar su email para poder completar su perfil',
      );
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
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        this.cloudinaryService.uploadCertificate(file),
      );
      const results = await Promise.all(uploadPromises);
      // Filtramos por si alguno falló y obtén solo las Uque si se subieron
      certificateUrls = results
        .filter((result) => result?.secure_url)
        .map((result) => result!.secure_url);
    }

    //si pasa las validaciones creamos una instancia con los datos del dto
    const newProfile = this.profilesRepository.create({
      ...createProfileDto,
      user: user, //asignamos la relacion al usuario
      approvalStatus: ApprovalStatus.PENDING, //poemosen pendiente provisional para pruebas ya que esto se debe aprobar por el admin
      certificates: certificateUrls, //le pasamos las url de cloudinary
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
  async updateProfile(
    userId: string,
    updateDto: UpdateProfessorProfileDto,
    files: Array<Express.Multer.File>,
  ) {
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
    if (files && files.length > 0) {
      hasNewFiles = true;

      //Subimos los nuevo archivos a cloudinary
      const uploadPromises = files.map((file) =>
        this.cloudinaryService.uploadCertificate(file),
      ); //Llamamos al metodo para subir los archivos

      const results = await Promise.all(uploadPromises);
      const newUrls = results
        .filter((result) => result?.secure_url)
        .map((result) => result!.secure_url);

      //Añadimos las nuevas urls al arreglo de cetificates
      if (!profile.certificates) {
        profile.certificates = [];
      }

      profile.certificates.push(...newUrls);
    }

    //si cambio un campo imporytante resetamos el estado a pendiente
    if (hasSesnsitiveChanges || hasNewFiles) {
      profile.approvalStatus = ApprovalStatus.PENDING;
    }

    //Guardamos el perfil con los cambiso hechos
    return this.profilesRepository.save(profile);
  }

  /**
   * Metodo para que un estudiante solicite ser profesor
   */
    async requestTeacherRole(userId: string, createProfileDto: CreateProfessorProfileDto, files: Array<Express.Multer.File>) {
      //buscamos el usuario
      const user = await this.userRepository.findUserById(userId);
      if(!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      //Validamos el rol sea estudiante
      if(user.role !== UserRole.STUDENT) {
        throw new ForbiddenException('Solo los estudiantes pueden solicitar el ascenso a profesor')
      }

      //validamos si ya tiene una solicitud de ascenso
      if(user.isRequestingTeacherRole) {
        throw new ConflictException('Ya tiene una solicitud de ascenso a profesor pendiente')
      }

      //subimos los archivos a cloudinary
      let certificateUrls: string[] = [];
      if(files && files.length > 0) {
        const uploadPromises = files.map(file => this.cloudinaryService.uploadCertificate(file));
        const results = await Promise.all(uploadPromises);
        certificateUrls = results.filter(result => result?.secure_url).map(result => result!.secure_url) 
      } else {
        throw new BadRequestException('Se requieren adjuntar certificados para la solicitud de ascenso a profesor')
      }

      //creamos la entidad profesorProfile
      const newProfile = this.profilesRepository.create({
        ...createProfileDto,
        user: user,
        certificates: certificateUrls,
        approvalStatus: ApprovalStatus.PENDING
      })

      //guardamos el nuevo perfil
      await this.profilesRepository.save(newProfile);

      //actualizamos el estado de solicitud a true
      user.isRequestingTeacherRole = true;
      user.RequestingTeacherRoleDate = new Date();
      await this.userRepository.save(user);
      
      //Enviamos el email de confirmacion
      try {
        await this.mailService.sendRoleRequestPendingEmail(user.email, user.name)
      } catch(emailError) {
        throw new BadRequestException(`Error al enviar el email de solicitud de profesor: ${user.id}:`, emailError)
      }

      return {
        message: 'Solicitud enviada exitosamente. Tu perfil será revisado por un administrador.'
      }
  }

  /**
   * Metodo que aprueba la solicitud de cambio de rol a profesor
   */
  async approvedTeacherRequest(userId: string) {
    //Buscamos al ususrio(por su perfil de profesor)
    const user = await this.userRepository.findUserWithProfile(userId);

    if(!user) {
      throw new NotFoundException('Usuario no encontrado')
    }

    const profile = user.professorProfile;
    if(!profile) {
      throw new NotFoundException('Este usuario no tienes una solicitud de perfil de profesor')
    }

    if(profile.approvalStatus !== ApprovalStatus.PENDING){
      throw new ConflictException('Esta solicitud ya fue procesada')
    }

    //actualizamos su estatus
    profile.approvalStatus = ApprovalStatus.APPROVED;

    //cambiamos el rol
    user.role = UserRole.TEACHER;
    //regreamos a false la solicitud
    user.isRequestingTeacherRole = false;

    //guardamos en los cambios
    await this.profilesRepository.save(profile);
    await this.userRepository.save(user);

    try {
      await this.mailService.sendRoleRequestApprovedEmail(user.email, user.name, "Profesor")
    } catch(emailError) {
      throw new BadRequestException('Error al enviar el email de solicitud de profesor:', emailError)
    }

    return {
      message: 'Solicitud de ascenso a profesor aprobada correctamente'
    }
    
  }

  /**
   * MEtodo que rechaza el cambio de rol de estudiante a profesor
   */
  async rejectTeacherRequest(userId: string, rejectDto: RejectRequestDto){
    const {reason} = rejectDto;

    //buscamos al usuario y su perfil
    const user = await this.userRepository.findUserWithProfile(userId);

    if(!user) {
      throw new NotFoundException('Usuario no encontrado')
    }

    const profile = user.professorProfile;

    if(!profile) {
      throw new NotFoundException('Este usuario no tiene un solicitud de cambio de rol')
    }

    //valida que la solicitud este en pendiente
    if(profile.approvalStatus !== ApprovalStatus.PENDING) {
      throw new ConflictException('Esta solicitud ya fue procesada (aprobada o rechazada')
    }

    //actualizamos el perfil con el estado y motivo del rechazo
    profile.approvalStatus = ApprovalStatus.REJECTED;
    profile.rejectionReason = reason;

    //regresamos a false 
    user.isRequestingTeacherRole = false;

    //enviamos el email de rechazo
    try {
      await this.mailService.sendRoleRequestRejectedEmail(user.email, user.name, reason)
    } catch(emailError) {
      throw new BadRequestException(`Solicitud de rol rechazada para el ${user.id}, pero fallo el envio del email`, emailError)
    }

    return {
      message: 'Solicitud rechazada exitosamente'
    }
  }

  async getProfessors(status) {
    return await this.profilesRepository.getProfessors(status);
  }

  async getProfessorById(id: string) {
    const professorFind = await this.profilesRepository.findById(id);
    return professorFind;
  }


   async getApprovalStatusByUserId(userId: string) {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Solo los profesores pueden consultar su estado de aprobación');
    }

    const professorProfile = await this.profilesRepository.findByUserId(userId);
    if (!professorProfile) {
      return {
        hasProfile: false,
        approvalStatus: null,
        message: 'No has completado tu perfil de profesor'
      };
    }

    return {
      hasProfile: true,
      approvalStatus: professorProfile.approvalStatus,
      message: this.getApprovalStatusMessage(professorProfile.approvalStatus)
    };
  }

  private getApprovalStatusMessage(status: ApprovalStatus): string {
    switch (status) {
      case ApprovalStatus.PENDING:
        return 'Tu perfil está en revisión. En breve un administrador revisará tu solicitud.';
      case ApprovalStatus.APPROVED:
        return 'Tu perfil ha sido aprobado. Ya puedes crear cursos.';
      case ApprovalStatus.REJECTED:
        return 'Tu solicitud ha sido rechazada. Contacta con el administrador para más información.';
      default:
        return 'Estado desconocido.';
    }
  }

  async aprovedProfesor(professorId: string) {
    const professorFind = await this.profilesRepository.findById(professorId);
    if (!professorFind) throw new NotFoundException('Profesor no encontrado');

    if(professorFind.approvalStatus === ApprovalStatus.APPROVED) {
      throw new BadRequestException('El perfil de profesor ya fue aprobado anteriormente')
    }
    professorFind.approvalStatus = ApprovalStatus.APPROVED;
    const saveProfile = await this.profilesRepository.save(professorFind);

    try {
      await this.mailService.sendProfileApprovedEmail(professorFind.user.email, professorFind.user.name)
    } catch (emailError) {
      console.error('Error al enviar el email de aprobacion', emailError);
    }

    return saveProfile;
  }

  async declineProfesor(professorId: string, rejectDto: RejectRequestDto) {

    const {reason} = rejectDto;
    
    const professorFind = await this.profilesRepository.findById(professorId);
    if (!professorFind) throw new NotFoundException('Profesor no encontrado');

    professorFind.approvalStatus = ApprovalStatus.REJECTED;
    professorFind.rejectionReason = reason;

    try {
      await this.mailService.sendRejectProfile(professorFind.user.email, professorFind.user.name, reason)
    } catch(emailError) {
      throw new BadRequestException(`Solicitud de rol rechazada para el ${professorFind.user.id}, pero fallo el envio del email`, emailError)
    }

    return this.profilesRepository.save(professorFind);
  }

  /**
   * Metodo que obtiene el perfil de profesor apartir del id del usuario
   */
  private async getProfessorProfileId(userId: string): Promise<string> {
    const user = await this.userRepository.findUserWithProfile(userId);

    if(user.role !== UserRole.TEACHER || !user.professorProfile) {
      throw new ForbiddenException('Acceso denegado. No eres un profesor')
    }

    return user.professorProfile.id;
  }

  /**
   * Metodo que obtiene el historial de ganancia para el profesor logueado
   */
  async getMyEarningsHistory(userId: string,
    status: 'ALL' | 'PAID' | 'PENDING',
  ) {
    const professorId = await this.getProfessorProfileId(userId);
    const sales = await this.enrollmentRespository.findSalesForProfessor(
      professorId,
      status,
    );

    return sales.map(sale => {

      let detailedStatus = 'Pendiente';
      if (sale.payout) { 
        if (sale.payout.status === 'PAID') {
          detailedStatus = 'Pagado';
        } else {
          detailedStatus = 'En Proceso';
        }
      }


      return {
        saleId: sale.id,
        saleDate: sale.inscripcionDate,
        courseTitle: sale.course.title,
        // (Quitamos los datos del estudiante como pediste antes)
        yourEarnings: sale.professorEarnings,
        status: detailedStatus, // <-- Usamos el estado detallado
        paymentReference: sale.payout ? sale.payout.referenceNumber : null,
      };
    });
  }
}

