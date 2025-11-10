import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, DeepPartial } from 'typeorm'; // <-- 1. Importa DeepPartial
import { CreateUserDto } from './dto/create-user.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getAll(filters: { isActive?: boolean; role?: UserRole }) {
    const where: any = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.role) {
      where.role = filters.role;
    }
    const users = await this.userRepository.find({ where });
    return users.map((u) => {
      const { password, ...rest } = u;
      return rest;
    });
  }

  //Metodo que obtiene todos los usuarios de la base de datos
  async getUsers() {
    return this.userRepository.find();
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
        enrollments: true,
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
}
