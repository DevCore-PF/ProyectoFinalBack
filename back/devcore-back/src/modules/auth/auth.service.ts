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
import { use } from 'passport';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly userRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Metodo que implementa la lógica de Google
   */
  async validateAndHandleGoogleUser(
    googleUserDto: GoogleUserDto,
  ): Promise<User> {
    const { email, image } = googleUserDto;

    try {
      // Buscamos al usuario por su email
      const user = await this.userRepository.findUserByEmail(email);

      // si el el usuario "SI" existe ---
      if (user) {
        // Si el email existe PERO no es de Google, es un conflicto.
        if (!user.isGoogleAccount) {
          throw new ConflictException(
            `El email ${email} ya está registrado con contraseña. Por favor, inicia sesión localmente.`,
          );
        }

        // Si es un usuario de Google actualizamos su imagen
        if (image) {
          user.image = image;
        }
        // y guardamos el usuario
        await this.userRepository.save(user);
        return user;
      }

      // El usuario NO existe
      // se pasa la creación al UsersService
      const newUser = await this.userService.createGoogleUser(googleUserDto);
      return newUser;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException(
        'Error al procesar el login con Google',
      );
    }
  }

  /**
   * Metodo que implementa la lógica de Google
   */
  async validateAndHandleGitHubUser(
    githubUserDto: GithubUserDto,
  ): Promise<User> {
    const { email, image } = githubUserDto;

    try {
      // Buscamos al usuario por su email
      const user = await this.userRepository.findUserByEmail(email);

      // si el el usuario "SI" existe ---
      if (user) {
        // Si el email existe PERO no es de Google, es un conflicto.
        if (!user.isGitHubAccount) {
          throw new ConflictException(
            `El email ${email} ya está registrado con contraseña. Por favor, inicia sesión localmente.`,
          );
        }

        // Si es un usuario de github actualizamos su imagen
        if (image) {
          user.image = image;
        }
        // y guardamos el usuario
        await this.userRepository.save(user);
        return user;
      }

      // El usuario NO existe
      // se pasa la creación al UsersService
      const newUser = await this.userService.createGithubUser(githubUserDto);
      return newUser;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException(
        'Error al procesar el login con Google',
      );
    }
  }

  //Nuevo metodo para probar el registro de ambos provedores github y google
  async validateAndHandleSocialUser(profile: SocialProfileDto, action: 'login' | 'register'){
    const { email, name, image, provider, providerId } = profile;

    const user = await this.userRepository.findUserByEmail(email);


    //Logica de registro
    if(action === 'register'){
      if(user) {
        //aqui se valida para que no pueda registrarse de nuevo sin importar si fue con gihub, propio o google
        throw new ConflictException(`El email ${email} ya está registrado.`);
        //redirigimos al usuario al login
        
      }

      //si el mail del usuario no existe se registra
      const newUser = await this.userService.createSocialUser(profile)
      return newUser;
    }

    //Logica para el login
    if(action === 'login'){
      if(!user) {
        throw new NotFoundException(`El email ${email} no está registrado.`);
      }

      //pero si existe con google, github o el nuestro lo dejamos entrar y vinculamos su cuenta al registro que ya tiene
      if(provider === 'google'){
        user.isGoogleAccount = true;
        user.googleId = providerId;
      }
      if(provider === 'github') {
        user.isGitHubAccount = true;
        user.githubId = providerId;
      }

      //Actualizamos la imagen solamente si el usuario no tiene una
      if(!user.image && image){
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
      // // Si existe Y es de Google, no puede registrarse localmente
      // if (userExists.isGoogleAccount) {
      //   throw new BadRequestException(
      //     `El email ${registerUser.email} ya está registrado con Google. Por favor, inicia sesión con Google.`,
      //   );
      // }
      // // Si existe Y es de GitHub, no puede registrarse localmente
      // if (userExists.isGitHubAccount) {
      //   throw new BadRequestException(
      //     `El email ${registerUser.email} ya está registrado con GitHub. Por favor, inicia sesión con GitHub.`,
      //   )
      // }
      // Si existe y no es de google marca error de que ya existe
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

  /**
   * Metodo para reenviar correo de validacion
   */
  async resendVerificationEmail(resendDto: ResendVerificationDto){
    const {email} = resendDto;

    //Buscamos al usuario por el email que se ingreso
    const user = await this.userRepository.findUserByEmail(email);

    //validamos si el usuario existe, o si ya esta verificado, o si es una cuenta con login terceros y aun no tiene contraseña
    if(!user || user.isEmailVerified || !user.password){
      return {message: 'Si este correo esta registrado, recibiras un nuevo enlace de verificacion.'}
    }

    //si el usuario es valido y necesita la verificacion
    const newVerificationToken = uuidv4();
    user.emailVerificationToken = newVerificationToken;

    await this.mailService.sendVerificationEmail(user.email, newVerificationToken);

    // Retornamos el mismo mensaje genérico
    return { 
      message: 'Si este correo está registrado, recibirás un nuevo enlace de verificación.' 
    };
  }

  /**
   * Genera el JWT
   * Este método es llamado por el login local y por el callback de Google o Github
   */
  async login(user: User) {

    //Obtenemos la relacion
    let userRelations = user;

    if(user.role === UserRole.TEACHER) {
      userRelations = await this.userRepository.findUserByIdWithRelations(user.id, ['professorProfile']);
    } else if (user.role === UserRole.STUDENT) {
      userRelations = await this.userRepository.findUserByIdWithRelations(user.id, ['studentProfile'])
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

    const {password, ...userReturn} = userRelations;
    
    return {
      userReturn,
      access_token: this.jwtService.sign(payload),
    };
  }

  async selectUserRole(userId: string, role: UserRole) {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 1. Asignamos el rol
    user.role = role;

    //
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

  async validateLocalUserFirts(email: string, pass: string): Promise<any> {
    const user = await this.userRepository.findUserByEmail(email);

    // Revisa si el usuario existe y no es de Google
    if (!user || user.isGoogleAccount) {
      return null;
    }

    // Compara la contraseña hasheada si existe
    if (!user.password) {
      return null;
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


  async validateLocalUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepository.findUserByEmail(email);

    // Revisa si el usuario existe y no es de Google
    if (!user) {
      throw new NotFoundException(
        'Esta cuenta no está registrada. Por favor, regístrate primero.'
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
