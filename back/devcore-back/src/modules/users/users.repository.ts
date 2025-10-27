import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getAll() {
    const users = await this.userRepository.find();
    return users.map((user) => (user.isActive = true));
  }

  async createUser(user: CreateUserDto) {
    return this.userRepository.save(user);
  }

  async getById(id: string) {
    const findUser = await this.userRepository.findOneBy({ id });
    if (!findUser || !findUser?.isActive)
      throw new NotFoundException('Usuario no encontrado');

    return findUser;
  }

  async findUserByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  async saveUser(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async deleteUserRepo(id: string) {
    const findUser = await this.getById(id);
    if (!findUser) return new NotFoundException('Usuario no encontrado');
    findUser.isActive = false;
    await this.userRepository.save(findUser);
    return findUser;
  }
}
