import { InjectRepository } from "@nestjs/typeorm";
import { Cart } from "./entities/cart.entity";
import { Between, LessThan, Repository } from "typeorm";
import { use } from "passport";

export class CartRepository {
    constructor(@InjectRepository(Cart) private readonly cartRepository: Repository<Cart>){}

    //Busca un carrito y carga los cursos que tiene dentro
    async findByUserId(userId: string): Promise<Cart | null> {
        return this.cartRepository.findOne({
            where: {user: {id: userId}},
            relations: ['courses']
        })
    }

    //Crea un carrito nuevo para el usuario
    create(user: {id: string}): Cart {
        const cart = this.cartRepository.create({
            user: user,
            courses: []
        });
        return cart
    }

    // Firma de Sobrecarga 1: Acepta un ARREGLO de carritos
  save(carts: Cart[]): Promise<Cart[]>;
  
  // Firma de Sobrecarga 2: Acepta UN SOLO carrito
  save(cart: Cart): Promise<Cart>;

  /**
   * Guardamos la instancia (Implementación)
   * Esta es la implementación real que maneja ambos casos
   */
  async save(
    cart: Cart | Cart[],
  ): Promise<Cart | Cart[]> {
    
    // Ahora le pasamos 'cart' (que puede ser Cart o Cart[]).
    // El 'as any' aquí es seguro porque las "firmas" públicas
    // (arriba) ya le dan seguridad de tipos a quien llame a este método.
    // TypeORM sabrá qué hacer.
    return this.cartRepository.save(cart as any);
  }

  /**
   * NUEVO MÉTODO
   * Busca carritos que no han sido notificados y que fueron
   * actualizados en una ventana de tiempo específica (ej. entre 24 y 25 horas).
   */
  async findCartsToNotify(
    timeLimit: Date // <-- 2. Ahora solo acepta un argumento
  ): Promise<Cart[]> {
    return this.cartRepository.find({
      where: {
        // 3. Usa 'LessThan' (más antiguo que) en lugar de 'Between'
        updatedAt: LessThan(timeLimit), 
        notificationSent: false,
      },
      relations: {
        user: true, 
        courses: true, 
      },
    });
  }

  /**
   * NUEVO MÉTODO
   * Busca TODOS los carritos que aún no han recibido un recordatorio.
   * Usado por el Admin para el envío manual masivo.
   */
  async findAllCartsPendingNotification(): Promise<Cart[]> {
    return this.cartRepository.find({
      where: {
        notificationSent: false, // 1. Que no hayan sido notificados
      },
      relations: {
        user: true, // 2. Carga el 'user' (para email y nombre)
        courses: true, // 3. Carga los 'courses' (para la lista en el email)
      },
    });
  }
}