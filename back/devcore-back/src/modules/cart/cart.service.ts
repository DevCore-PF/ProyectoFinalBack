import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { CoursesRepository } from '../course/course.repository';
import { Cart } from './entities/cart.entity';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly courseRepository: CoursesRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  //Metodo para dos usos obtener el carrito o ceare si es que no existe
  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      cart = this.cartRepository.create({ id: userId });
      await this.cartRepository.save(cart);
    }
    return cart;
  }

  async addCourse(userId: string, courseId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const course = await this.courseRepository.findById(courseId);
    const user = await this.usersRepository.findUserById(userId);

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Valida si el profesor que publico el curso no lo pueda comprar

    if (
      user.professorProfile?.courses?.some((course) => course.id === courseId)
    )
      throw new BadRequestException('Ya tienes acceso a este este curso');

    const alreadyInCart = cart.courses.some((c) => c.id === courseId);
    if (!alreadyInCart) {
      cart.courses.push(course);
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  async removeCourse(userID: string, courseId): Promise<Cart> {
    const cart = await this.getOrCreateCart(userID);

    cart.courses = cart.courses.filter((c) => c.id !== courseId);

    await this.cartRepository.save(cart);
    return cart;
  }

  //metodo para limpiar el carrito despues de la compra
  async clearCart(userId: string): Promise<Cart | null> {
    //Busca el carrito con sus cursos
    const cart = await this.cartRepository.findByUserId(userId);

    //si tiene cursos y existe lo limpia
    if (cart && cart.courses.length > 0) {
      cart.courses = [];
      return this.cartRepository.save(cart);
    }
    return cart;
  }
}
