import { InjectRepository } from "@nestjs/typeorm";
import { Cart } from "./entities/cart.entity";
import { Repository } from "typeorm";
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

    //guarda los cambios de ñadir o quitar cursos del carrito
    save(cart: Cart): Promise<Cart> {
        return this.cartRepository.save(cart)
    }
}