import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, DeepPartial } from 'typeorm'; // <-- 1. Importa DeepPartial
import { CreateUserDto } from './dto/create-user.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getAll() {
    const users = await this.userRepository.find({
      where: { isActive: true },
    });
    return users.map(
      ({ password, ...userWithoutPassword }) => userWithoutPassword,
    );
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

  async findUserByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  // --- MÉTODOS NUEVOS NECESARIOS ---

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
