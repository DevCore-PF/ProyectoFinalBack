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

@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UsersService,
    private readonly userRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}

  /**
   * Metodo que implementa la lógica de Google
   */
  async validateAndHandleGoogleUser(googleUserDto: GoogleUserDto): Promise<User> {
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
   * Crea un usuario con nuestroo formulario
   */
  async create(registerUser: CreateUserDto) {
    const userExists = await this.userRepository.findUserByEmail(
      registerUser.email,
    );

    if (userExists) {
      // Si existe Y es de Google, no puede registrarse localmente
      if (userExists.isGoogleAccount) {
        throw new BadRequestException(
          `El email ${registerUser.email} ya está registrado con Google. Por favor, inicia sesión con Google.`,
        );
      }
      // Si existe y no es de google marca error de que ya existe
      throw new BadRequestException('El correo electrónico ya está en uso');
    }

    
    //validamos que las contraseñas coincidan
    if (registerUser.password !== registerUser.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    //creamo el token para la evrificacion
    const verificationToken = uuidv4();

    //creamos el usuario y le pasamos el token creado al emailverificationtoken para qye se envie
    const userCreate = {
      ...registerUser,
      emailVerificationToken: verificationToken,
    }

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
   * Genera el JWT
   * Este método es llamado por el login local y por el callback de Google.
   */
  login(user: User) {
    // El payload es la información que guardamos en el token
    const payload = { 
      sub: user.id, // sub se guarda el id
      email: user.email,
      role: user.role,
    };
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasCompletedProfile: user.hasCompletedProfile,
      },
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

    // 2. *** ESTA ES LA LÓGICA QUE QUERÍAS ***
    // Si es Estudiante, su perfil ya está "completo"
    if (role === UserRole.STUDENT) {
      user.hasCompletedProfile = false; 
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
    if (!user || user.isGoogleAccount) {
      return null;
    }

    // Compara la contraseña hasheada si existe
    if (!user.password) {
      return null;
    }
    const isPasswordMatch = await bcrypt.compare(pass, user.password);

    if (isPasswordMatch) {
      //Si la contraseña es correcta, devuelve el usuario (sin la contraseña)
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  //verificar el email por medio del token enviado
  async verifyEmailToken(token: string) {
    // Busca al usuario por el token
    const user = await this.userRepository.findUserByToken(token); 
    
    if (!user) {
      throw new BadRequestException('El token de verificación es inválido o ha expirado.');
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