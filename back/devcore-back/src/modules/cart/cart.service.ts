import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { CoursesRepository } from '../course/course.repository';
import { Cart } from './entities/cart.entity';
import { UsersRepository } from '../users/users.repository';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class CartService {

private readonly logger = new Logger(CartService.name);

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly courseRepository: CoursesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly mailService: MailService,
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
      cart.notificationSent = false
      cart.updatedAt = new Date();
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  async removeCourse(userID: string, courseId): Promise<Cart> {
    const cart = await this.getOrCreateCart(userID);

    cart.courses = cart.courses.filter((c) => c.id !== courseId);

    cart.notificationSent = false;
    cart.updatedAt = new Date();
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
      cart.notificationSent = true;
      return this.cartRepository.save(cart);
    }
    return cart;
  }

  /**
   * NUEVO MÉTODO (para el Admin)
   * Ignora el temporizador y envía un recordatorio a TODOS
   * los carritos abandonados y no notificados.
   * (Responde al Punto 4 de tu plan)
   */
  async triggerAllAbandonedCartEmails() {
    this.logger.log('[Admin] Iniciando envío masivo de recordatorios de carrito...');

    // 1. Busca todos los carritos que no han recibido notificación
    const allPendingCarts = await this.cartRepository.findAllCartsPendingNotification();

    // 2. Filtra solo los que tienen items y usuario
    const cartsToNotify = allPendingCarts.filter(
      (cart) => cart.user && cart.courses && cart.courses.length > 0,
    );

    if (cartsToNotify.length === 0) {
      this.logger.log('[Admin] No se encontraron carritos para notificar.');
      return { message: 'No hay carritos pendientes de notificar.' };
    }

    this.logger.log(`[Admin] Enviando ${cartsToNotify.length} recordatorios...`);

    let successCount = 0;
    const updatedCarts: Cart[] = []; // Arreglo para actualizar la BD

    // 3. Itera y envía los correos
    for (const cart of cartsToNotify) {
      try {
        await this.mailService.sendAbandonedCartEmail(
          cart.user.email,
          cart.user.name,
          cart.courses,
        );
        
        // 4. Prepara el carrito para la actualización de BD
        cart.notificationSent = true;
        updatedCarts.push(cart);
        successCount++;

      } catch (error) {
        this.logger.error(
          `[Admin] Falló el envío de email de carrito a ${cart.user.email}`,
          error.stack,
        );
        // No detenemos el bucle, continuamos con el siguiente
      }
    }

    // 5. Guarda todos los carritos actualizados en una sola consulta de BD
    if (updatedCarts.length > 0) {
      await this.cartRepository.save(updatedCarts);
    }

    return {
      message: 'Operación completada.',
      sent: successCount,
      totalFound: cartsToNotify.length,
    };
  }
}
