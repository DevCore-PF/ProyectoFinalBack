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

@Injectable()
export class AuthService {
  // El constructor se queda igual
  constructor(
    private readonly userService: UsersService,
    private readonly userRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}

  /**
   * MÉTODO NUEVO: Implementa la lógica de Google
   */
  async validateAndHandleGoogleUser(googleUserDto: GoogleUserDto): Promise<User> {
    const { email, image } = googleUserDto;

    try {
      // 1. Buscamos al usuario por su email
      const user = await this.userRepository.findUserByEmail(email);

      // --- CASO 1: El usuario SÍ existe ---
      if (user) {
        // REGLA: Si el email existe PERO no es de Google, es un conflicto.
        if (!user.isGoogleAccount) {
          throw new ConflictException(
            `El email ${email} ya está registrado con contraseña. Por favor, inicia sesión localmente.`,
          );
        }

        // Si es un usuario de Google, actualizamos su imagen (opcional) y lo retornamos
        if (image) {
          user.image = image;
        }
        // Asumimos que tu UsersRepository (que extiende Repository<User>) tiene .save()
        await this.userRepository.save(user); 
        return user;
      }

      // --- CASO 2: El usuario NO existe ---
      // Delegamos la creación al UsersService para mantener tu arquitectura
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
   * MÉTODO 'create' (local): Actualizado
   */
  async create(registerUser: CreateUserDto) {
    const userExists = await this.userRepository.findUserByEmail(
      registerUser.email,
    );

    // --- REGLA DE NEGOCIO ACTUALIZADA ---
    if (userExists) {
      // REGLA: Si existe Y es de Google, no puede registrarse localmente
      if (userExists.isGoogleAccount) {
        throw new BadRequestException(
          `El email ${registerUser.email} ya está registrado con Google. Por favor, inicia sesión con Google.`,
        );
      }
      // Si existe y no es de Google, es el error que ya tenías
      throw new BadRequestException('El correo electrónico ya está en uso');
    }
    // --- FIN DE LA ACTUALIZACIÓN ---

    

    if (registerUser.password !== registerUser.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const verificationToken = uuidv4();

    const userCreate = {
      ...registerUser,
      emailVerificationToken: verificationToken,
    }

    // Tu lógica de creación se mantiene
    const newUser = await this.userService.create(userCreate);

    // 7. Envía el email
    await this.mailService.sendVerificationEmail(
      newUser.email,
      verificationToken,
    );

    return this.login(newUser);
  }

  /**
   * 4. MÉTODO NUEVO: Genera el JWT
   * Este método es llamado por el login local y por el callback de Google.
   */
  login(user: User) {
    // El payload es la información que guardamos en el token
    const payload = { 
      sub: user.id, // 'sub' (subject) es el estándar para el ID de usuario
      email: user.email,
      role: user.role,
    };
    
    return {
      message: 'Inicio de sesión exitoso',
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

  async verifyEmailToken(token: string) {
    // 1. Busca al usuario por el token
    const user = await this.userRepository.findUserByToken(token); // (Debes crear este método en tu UsersRepository)
    
    if (!user) {
      throw new BadRequestException('El token de verificación es inválido o ha expirado.');
    }

    // 2. Actualiza al usuario
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined; // Limpiamos el token
    
    await this.userRepository.save(user);

    return { message: 'Email verificado exitosamente.' };
  }

  findAll() {
    return `This action returns all auth`;
  }
}