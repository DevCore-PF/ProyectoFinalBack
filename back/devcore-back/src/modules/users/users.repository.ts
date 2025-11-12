import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, DeepPartial } from 'typeorm'; // <-- 1. Importa DeepPartial
import { CreateUserDto } from './dto/create-user.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from './enums/user-role.enum';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getAllActiveUser() {
    const users = await this.userRepository.find({ where: { isActive: true } });
    return users.map((u) => {
      const { password, ...rest } = u;
      return rest;
    });
  }

  async getAllUsers() {
    const users = await this.userRepository.find();
    return users.map((u) => {
      const { password, ...rest } = u;
      return rest;
    });
  }

  async getUserByRole(role: UserRole) {
    const users = await this.userRepository.find({ where: { role: role } });
    return users.map((u) => {
      const { password, ...rest } = u;
      return rest;
    });
  }

  //Metodo que obtiene todos los usuarios de la base de datos
  async getAllInactiveUser() {
    const users = await this.userRepository.find({
      where: { isActive: false },
    });
    return users.map((u) => {
      const { password, ...rest } = u;
      return rest;
    });
  }

  //Metodo que crea un usuario nuevo en la base de datos
  //
  async createUser(user: CreateUserDto) {
    // Es mejor usar create + save
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async findUserById(id: string) {
    const findUser = await this.userRepository.findOneBy({ id });
    if (!findUser || !findUser?.isActive)
      throw new NotFoundException('Usuario no encontrado');
    return findUser;
  }

  async findUserByIdWithRelations(id: string, relations: string[]) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations,
    });

    if (!user || !user.isActive) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async updateUser(updatedUser) {
    return this.userRepository.save(updatedUser);
  }

  async findUserWithPurchasedCourses(userId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        enrollments: {
          course: {
            professor: {
              user: true,
            },
          },
        },
      },
      select: {
        enrollments: {
          id: true,
          progress: true,
          priceAtPurchase: true,
          inscripcionDate: true,
          completedAt: true,
          course: {
            id: true,
            title: true,
            description: true,
            price: true,
            category: true,
            difficulty: true,
            duration: true,
            professor: {
              id: true,
              user: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    return user;
  }

  async findUserByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  /**
   * Busca a un usuario por el token de cambio de contraseña
   */
  async findUserByChangeToken(token: string): Promise<User | null> {
    return this.userRepository.findOneBy({ newPasswordToken: token });
  }

  /**
   * Método 'create'
   * Permite a los servicios crear una instancia de la entidad User
   * (sin guardarla aún)
   */
  create(userPartialData: DeepPartial<User>): User {
    return this.userRepository.create(userPartialData);
  }

  async findUserByToken(token: string) {
    return this.userRepository.findOneBy({ emailVerificationToken: token });
  }

  async findUserWithProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        professorProfile: true,
        enrollments: { course: { professor: { user: true } } },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        checkBoxTerms: true,
        image: true,
        isGitHubAccount: true,
        googleId: true,
        isEmailVerified: true,
        emailVerificationToken: true,
        resetPasswordToken: true,
        resetPasswordExpires: true,
        hasCompletedProfile: true,
        createdAt: true,
        isGoogleAccount: true,
        githubId: true,
        newPasswordRequest: true,
        newPasswordToken: true,
        ciudad: true,
        direccion: true,
        dni: true,
        telefono: true,
        fechaNacimiento: true,
        genero: true,
        enrollments: {
          id: true,
          completed: true,
          completedAt: true,
          priceAtPurchase: true,
          inscripcionDate: true,
          progress: true,
          diplomaUrl: true,

          course: {
            id: true,
            title: true,
            duration: true,

            professor: {
              id: true,
              speciality: true,
              user: { id: true, name: true },
            },
          },
        },
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  /**
   * Método 'save'
   * Permite a los servicios guardar (crear o actualizar) una entidad User
   * en la base de datos.
   */
  save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async deleteUserRepo(id: string) {
    const findUser = await this.findUserById(id);
    if (!findUser) return new NotFoundException('Usuario no encontrado');
    findUser.isActive = false;
    await this.userRepository.save(findUser);
    return findUser;
  }

  async findInactiveUser(userId: string) {
    return await this.userRepository.findOne({
      where: { id: userId, isActive: false },
    });
  }
}
