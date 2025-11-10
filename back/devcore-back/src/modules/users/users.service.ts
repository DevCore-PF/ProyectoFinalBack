import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { GoogleUserDto } from '../auth/dto/google-user.dto';
import { User } from './entities/user.entity';
import { GithubUserDto } from '../auth/dto/github-user.dto';
import { SocialProfileDto } from '../auth/dto/socialProfile.dto';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UsersRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      if (!hashedPassword) {
        throw new BadRequestException('Error al hasehar el password');
      }

      const newUser = this.userRepository.createUser({
        ...createUserDto,
        password: hashedPassword,
      });

      await queryRunner.commitTransaction();
      return newUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createGoogleUser(googleUserDto: GoogleUserDto): Promise<User> {
    const { email, name, image, googleId } = googleUserDto;

    const newUser = this.userRepository.create({
      email,
      name,
      image,
      googleId,
      isGoogleAccount: true, // se marca en true ya que damos por hecho al registrarse con google
      isEmailVerified: true, //se verifica automaticamente por que se inicio con google
      role: undefined, //Rol por defecto
      password: undefined, // No se le asiga contraseña por que se maneja con google
    });

    try {
      await this.userRepository.save(newUser);
      return newUser;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error al guardar el nuevo usuario de Google',
      );
    }
  }

  async createGithubUser(githubUserDto: GithubUserDto): Promise<User> {
    const { email, name, image, githubId } = githubUserDto;

    const newUser = this.userRepository.create({
      email,
      name,
      image,
      githubId,
      isGitHubAccount: true, // se marca en true ya que damos por hecho al registrarse con google
      isEmailVerified: true, //se verifica automaticamente por que se inicio con google
      role: undefined, //Rol por defecto
      password: undefined, // No se le asiga contraseña por que se maneja con google
    });

    try {
      await this.userRepository.save(newUser);
      return newUser;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error al guardar el nuevo usuario de Github',
      );
    }
  }

  //Metodo para manejar los dos tipos de sesion
  createSocialUser(profile: SocialProfileDto): Promise<User> {
    const { email, name, image, provider, providerId } = profile;

    const newUser = this.userRepository.create({
      email,
      name,
      image,
      role: undefined,
      hasCompletedProfile: false,
      isEmailVerified: true,

      //vinculamos la cuenta correcta
      isGoogleAccount: provider === 'google',
      googleId: provider === 'google' ? providerId : undefined,
      isGitHubAccount: provider === 'github',
      githubId: provider === 'github' ? providerId : undefined,

      password: undefined,
    });
    return this.userRepository.save(newUser);
  }

  async updateUserImage(id: string, imageUrl: string) {
    try {
      const user = await this.userRepository.findUserById(id);
      if (!user) throw new NotFoundException('Usuario no encontrado');

      user.image = imageUrl;
      await this.userRepository.save(user);
      return { message: 'Imagen actualizada correctamente' };
    } catch (error) {
      console.error('Error actualizando imagen del usuario:', error);
      throw new InternalServerErrorException(
        'Error al actualizar la imagen del usuario',
      );
    }
  }

  async getAllActiveUser() {
    return await this.userRepository.getAllActiveUser();
  }

  async getAllInactiveUser() {
    return await this.userRepository.getAllInactiveUser();
  }

  async getUserPurchasedCourses(userId: string) {
    const user = await this.userRepository.findUserWithPurchasedCourses(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user.enrollments.map((enrollment) => ({
      id: enrollment.course.id,
      title: enrollment.course.title,
      description: enrollment.course.description,
      price: enrollment.course.price,
      category: enrollment.course.category,
      difficulty: enrollment.course.difficulty,
      progress: enrollment.progress,
      purchaseDate: enrollment.inscripcionDate,
      priceAtPurchase: enrollment.priceAtPurchase,
      completed: !!enrollment.completedAt,
      enrollmentId: enrollment.id,
    }));
  }

  async getUserById(id: string) {
    const userFind = await this.userRepository.findUserWithProfile(id);
    const { password, ...userWithoutPassword } = userFind;
    return userWithoutPassword;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async deleteUser(id: string) {
    return await this.userRepository.deleteUserRepo(id);
  }

  async updateCheckbox(id: string) {
    const userFind = await this.userRepository.findUserById(id);
    userFind.checkBoxTerms = true;
    await this.userRepository.save(userFind);
    return userFind;
  }
}
