import {
  BadRequestException,
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersRepository } from '../users/users.repository';
import { GoogleUserDto } from './dto/google-user.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { GithubUserDto } from './dto/github-user.dto';
import { SocialProfileDto } from './dto/socialProfile.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ChangePasswordRequestDto } from './dto/change-password-request.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateUserAdminDto } from '../users/dto/create-user-admin.dto';
import { use } from 'passport';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly userRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  //Nuevo metodo para probar el registro de ambos provedores github y google
  async validateAndHandleSocialUser(
    profile: SocialProfileDto,
    action: 'login' | 'register',
  ) {
    const { email, name, image, provider, providerId } = profile;

    const user = await this.userRepository.findUserByEmail(email);

    //Logica de registro
    if (action === 'register') {
      if (user) {
        if (user?.isActive === false && user.isEmailVerified === true) {
          console.log('🚫 Usuario baneado detectado');
          throw new BadRequestException(
            'Tu cuenta ha sido suspendida. Por favor, contacta al soporte para más información.',
          );
        }
        //aqui se valida para que no pueda registrarse de nuevo sin importar si fue con gihub, propio o google
        throw new ConflictException(`El email ${email} ya está registrado.`);
        //redirigimos al usuario al login
      }

      //si el mail del usuario no existe se registra
      const newUser = await this.userService.createSocialUser(profile);
      return newUser;
    }

    //Logica para el login
    if (action === 'login') {
      if (!user) {
        throw new NotFoundException(`El email ${email} no está registrado.`);
      }

      // Verificar si el usuario está baneado
      if (user.isActive === false && user.isEmailVerified === true) {
        console.log('🚫 Usuario baneado detectado en OAuth login');
        throw new BadRequestException(
          'Tu cuenta ha sido suspendida. Por favor, contacta al soporte para más información.',
        );
      }

      //pero si existe con google, github o el nuestro lo dejamos entrar y vinculamos su cuenta al registro que ya tiene
      if (provider === 'google') {
        user.isGoogleAccount = true;
        user.googleId = providerId;
      }
      if (provider === 'github') {
        user.isGitHubAccount = true;
        user.githubId = providerId;
      }

      //Actualizamos la imagen solamente si el usuario no tiene una
      if (!user.image && image) {
        user.image = image;
      }

      await this.userRepository.save(user);
      return user;
    }
  }

  /**
   * Crea un usuario con nuestroo formulario
   */
  async create(registerUser: CreateUserDto) {
    const userExists = await this.userRepository.findUserByEmail(
      registerUser.email,
    );

    if (userExists) {
      if (
        userExists.isActive === false &&
        userExists.isEmailVerified === true
      ) {
        throw new BadRequestException(
          'Tu cuenta ha sido suspendida. Por favor, contacta al soporte para más información.',
        );
      }
      throw new BadRequestException('El correo electrónico ya está en uso');
    }

    //validamos que las contraseñas coincidan
    if (registerUser.password !== registerUser.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    if (!registerUser.checkBoxTerms) {
      throw new BadRequestException('Debe aceptar lo terminos y condiciones');
    }

    //creamo el token para la evrificacion
    const verificationToken = uuidv4();

    //creamos el usuario y le pasamos el token creado al emailverificationtoken para qye se envie
    const userCreate = {
      ...registerUser,
      emailVerificationToken: verificationToken,
    };

    //se crea el usuario
    const newUser = await this.userService.create(userCreate);

    // Se envia el email con el token para la valdiacion
    await this.mailService.sendVerificationEmail(
      newUser.email,
      verificationToken,
    );

    //retornamos el usaurio con su token y el rol
    return this.login(newUser);
  }

  // Se registra un nuevo usuario admin

  // Nuevo método para admin
  async createAdmin(createAdminDto: CreateUserAdminDto) {
    const userExists = await this.userRepository.findUserByEmail(
      createAdminDto.email,
    );

    if (userExists) {
      throw new BadRequestException('El correo electrónico ya está en uso');
    }

    // Validar que las contraseñas coincidan
    if (createAdminDto.password !== createAdminDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

    if (!hashedPassword) {
      throw new BadRequestException('Error al hashear el password');
    }

    // Admin crea usuario ya verificado y activo
    const userCreate = {
      ...createAdminDto,
      password: hashedPassword,
      isEmailVerified: true,
      isActive: true,
      role: UserRole.ADMIN,
      emailVerificationToken: undefined,
    };

    const newUser = await this.userRepository.createAdmin(userCreate);

    //  Enviar email de bienvenida con las credenciales
    try {
      await this.mailService.sendWelcomeAdminEmail(
        newUser.email,
        newUser.name,
        createAdminDto.password, //  Contraseña sin hashear para enviar por email
      );
    } catch (error) {
      console.error('Error al enviar email de bienvenida:', error);
      // No lanzamos error aquí para que el admin se cree igual
    }

    // Retornar sin la contraseña
    const { password, ...userWithoutPassword } = newUser;

    return {
      message:
        'Administrador creado exitosamente. Se ha enviado un email con las credenciales de acceso.',
      user: userWithoutPassword,
    };
  }

  /**
   * Metodo para cambio de contraseña usuario la olvido
   */
  async requestPasswordReset(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.userRepository.findUserByEmail(email);

    //aqui si el usuario no existe o si el usuario se registro con google o git pero aun no asigno contraseña
    //mandaremos un mensaje generico en vez de un error
    if (!user || !user.password) {
      return {
        message:
          'Si este correo esta registrado y tiene contraseña local, recibira un enlace para restablecer su contraseña',
      };
    }

    //generamos el token y la fecha de expiracion se coloca  1 hora
    const resetToken = uuidv4();
    const expires = new Date(Date.now() + 3600000);

    //guardamos el token y la expirsacion en el usuario
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expires;

    await this.userRepository.save(user);

    //enviamos el email del reseteo
    try {
      await this.mailService.sendPasswordResetEmail(
        user.email,
        user.name,
        resetToken,
      );
    } catch (error) {
      throw new BadRequestException(
        `Error al enviar el email de reseteo: ${error.message}`,
      );
    }

    return {
      message:
        'Si este correo esta registrado y tiene contraseña local, recibira un enlace para restablecer su contraseña',
    };
  }

  /**
   * Metodo para confirmar la contraseña desde el email que recibio el usuario por olvido de contraseña
   */
  async resetPassword(resetPassword: ResetPasswordDto) {
    const { token, newPassword, confirmNewPassword } = resetPassword;

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    //buscamos al usuario por el token y que no este expirado
    const user = await this.userRepository.findUserByResetToken(token);

    if(user?.password === resetPassword.newPassword) {
      throw new BadRequestException('La contraseña es la misma que la anterior');
    }

    if (!user) {
      throw new BadRequestException('Token invalido o expirado');
    }

    //si el token es valido hasehamos y actualizamos la contraseña
    user.password = await bcrypt.hash(newPassword, 10);

    //limpiamos los datos del reseteo
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    //guarda al usuario con su nueva contraseña
    await this.userRepository.save(user);

    return {
      message: 'Contraseña actualizada correctamente',
    };
  }

  /**
   * Metodo para reenviar correo de validacion
   */
  async resendVerificationEmail(resendDto: ResendVerificationDto) {
    const { email } = resendDto;

    //Buscamos al usuario por el email que se ingreso
    const user = await this.userRepository.findUserByEmail(email);

    //validamos si el usuario existe, o si ya esta verificado, o si es una cuenta con login terceros y aun no tiene contraseña
    if (!user || user.isEmailVerified || !user.password) {
      return {
        message:
          'Si este correo esta registrado, recibiras un nuevo enlace de verificacion.',
      };
    }

    //si el usuario es valido y necesita la verificacion
    const newVerificationToken = uuidv4();
    user.emailVerificationToken = newVerificationToken;

    await this.mailService.sendVerificationEmail(
      user.email,
      newVerificationToken,
    );

    // Retornamos el mismo mensaje genérico
    return {
      message:
        'Si este correo está registrado, recibirás un nuevo enlace de verificación.',
    };
  }

  /**
   * Metodo para solicitar el cambio de contraseña desde el panel del usuario logueado
   */
  async requestPasswordChange(
    userId: string,
    changePasswordDto: ChangePasswordRequestDto,
  ) {
    const { newPassword, confirmNewPassword } = changePasswordDto;

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const user = await this.userRepository.findUserById(userId);

    if(user.password === changePasswordDto.newPassword){
      throw new BadRequestException('La contraseña es la misma que la anterior');
    }
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    //aqui validamos si el usuario se registro con google y quiere solicitar cambio pero aun no tiene le mand eun error de que primero debe asiganrla
    if (!user.password) {
      throw new BadRequestException(
        'Las cuentas sociales deben asignar una contraseña primero.',
      );
    }

    //Hasheams la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    //Genera el token de confirmación
    const confirmationToken = uuidv4();

    //Guarda el hash y el token en la BD esto es temporal
    user.newPasswordRequest = hashedNewPassword;
    user.newPasswordToken = confirmationToken;
    await this.userRepository.save(user);

    //Envía el correo de confirmación
    await this.mailService.sendPasswordChangeConfirmation(
      user.email,
      confirmationToken,
    );

    return {
      message: 'Solicitud recibida. Revisa tu correo para confirmar el cambio.',
    };
  }

  /**
   * Metodo para confirmar el cambio de contraseña en el mail que le llego al usuario
   */
  async confirmPasswordChange(token: string) {
    //Busca al usuario por el token de cambio
    const user = await this.userRepository.findUserByChangeToken(token);

    if (!user || !user.newPasswordRequest) {
      throw new BadRequestException('El token es inválido o ha expirado.');
    }

    // el token es validado
    //y cambiamos la contraseña original por la temporal
    user.password = user.newPasswordRequest;

    //Limpiamos los campos temporales
    user.newPasswordRequest = undefined;
    user.newPasswordToken = undefined;

    // 4. Guardamos el usuario con su contraseña actualizada
    await this.userRepository.save(user);

    return { message: 'Contraseña actualizada exitosamente.' };
  }

  /**
   * Genera el JWT
   * Este método es llamado por el login local y por el callback de Google o Github
   */
  async login(user: User) {
    //Obtenemos la relacion
    let userRelations = user;

    if(!user.isEmailVerified) {
      throw new BadRequestException('Debe verifiar su email para poder iniciar sesion');
    }

    if (user.role === UserRole.TEACHER) {
      userRelations = await this.userRepository.findUserByIdWithRelations(
        user.id,
        ['professorProfile'],
      );
    } else if (user.role === UserRole.STUDENT) {
      userRelations = await this.userRepository.findUserByIdWithRelations(
        user.id,
        ['studentProfile'],
      );
    } else {
      // Si es admin o cualquier otro rol, no cargamos relaciones
      userRelations = await this.userRepository.findUserById(user.id);
    }

    // El payload es la información que guardamos en el token
    const payload = {
      sub: user.id, // sub se guarda el id
      email: user.email,
      role: user.role,
    };

    const { password, ...userReturn } = userRelations;

    return {
      userReturn,
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * MEtodo para el deslogueo
   */
  async serverLogout(userId: string) {
    await this.userService.clearSocialTokens(userId);
    return { message: 'Sesión cerrada exitosamente.' };
  }

  

  async selectUserRole(userId: string, role: UserRole) {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 1. Asignamos el rol
    user.role = role;

    // Si es Estudiante, su perfil ya está "completo"
    if (role === UserRole.STUDENT) {
      user.hasCompletedProfile = true;
    }
    // Si es Profesor, su perfil AÚN NO está completo.
    // Dejamos hasCompletedProfile en 'false' a propósito.
    else if (role === UserRole.TEACHER) {
      user.hasCompletedProfile = false; // Ya estaba en false, pero lo dejamos explícito
    }

    const updatedUser = await this.userRepository.save(user);

    // 3. Devolvemos un NUEVO token con la información actualizada
    return this.login(updatedUser);
  }

  async validateLocalUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepository.findUserByEmail(email);

    // Revisa si el usuario existe y no es de Google
    if (!user) {
      throw new NotFoundException(
        'Esta cuenta no está registrada. Por favor, regístrate primero.',
      );
    }

    // Verificar si el usuario está baneado
    if (user.isActive === false && user.isEmailVerified === true) {
      throw new BadRequestException(
        'Tu cuenta ha sido suspendida. Por favor, contacta al soporte para más información.',
      );
    }

    // Compara la contraseña hasheada si existe
    if (!user.password) {
      throw new ConflictException(
        'Te registraste usando un proveedor social (Google o GitHub). Por favor, inicia sesión con ese método o asigna una contraseña en tu panel de control.',
      );
    }

    //Verificamos que el usario haya  validad su email desde su correo
    if (!user.isEmailVerified) {
      throw new BadRequestException(
        'Debe verifiar su email para poder iniciar sesion',
      );
    }

    const isPasswordMatch = await bcrypt.compare(pass, user.password);

    if (isPasswordMatch) {
      //Si la contraseña es correcta, devuelve el usuario (sin la contraseña)
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  /**
   * Metod que permite a un usuario logueado (social)
   * añadir una contraseña local.
   */
  async setLocalPassword(userId: string, setPasswordDto: SetPasswordDto) {
    if (setPasswordDto.password !== setPasswordDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }


    const user = await this.userRepository.findUserById(userId);

    if(user.password === setPasswordDto.password) {
      throw new BadRequestException('La contraseña es la misma que la anterior');
    }

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Hashea y guarda la nueva contraseña
    const hashedPassword = await bcrypt.hash(setPasswordDto.password, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return { message: 'Contraseña asignada exitosamente.' };
  }

  //verificar el email por medio del token enviado
  async verifyEmailToken(token: string) {
    // Busca al usuario por el token
    const user = await this.userRepository.findUserByToken(token);

    if (!user) {
      throw new BadRequestException(
        'El token de verificación es inválido o ha expirado.',
      );
    }

    // Actualiza al usuario su estado de verificacion
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;

    await this.userRepository.save(user);

    return { message: 'Email verificado exitosamente.' };
  }

  findAll() {
    return `This action returns all auth`;
  }
}
