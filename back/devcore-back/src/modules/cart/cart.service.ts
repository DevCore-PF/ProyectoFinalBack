import { Injectable, NotFoundException } from "@nestjs/common";
import { CartRepository } from "./cart.repository";
import { CoursesRepository } from "../course/course.repository";
import { Cart } from "./entities/cart.entity";

@Injectable()
export class CartService {
    constructor(private readonly cartRepository: CartRepository,
        private readonly courseRepository: CoursesRepository
    ){}

    //Metodo para dos usos obtener el carrito o ceare si es que no existe
    async getOrCreateCart(userId: string): Promise<Cart> {
        let cart = await this.cartRepository.findByUserId(userId);
        if(!cart){
            cart = this.cartRepository.create({id: userId});
            await this.cartRepository.save(cart)
        }
        return cart
    }

    async addCourse(userId: string, courseId: string): Promise<Cart> {
        const cart = await this.getOrCreateCart(userId);
        const course = await this.courseRepository.findById(courseId);

        if(!course){
            throw new NotFoundException('Curso no encontrado')
        }

        const alreadyInCart = cart.courses.some((c) => c.id === courseId);
        if(!alreadyInCart){
            cart.courses.push(course);
            await this.cartRepository.save(cart)
        }

        return cart
    }

    async removeCourse(userID: string, courseId): Promise<Cart> {
        const cart = await this.getOrCreateCart(userID);

        cart.courses = cart.courses.filter((c) => c.id !== courseId)

        await this.cartRepository.save(cart)
        return cart
    }

    //metodo para limpiar el carrito despues de la compra
    async clearCart(userId: string): Promise<Cart | null> {
        //Busca el carrito con sus cursos
        const cart = await this.cartRepository.findByUserId(userId);

        //si tiene cursos y existe lo limpia
        if(cart && cart.courses.length > 0){
            cart.courses = []
            return this.cartRepository.save(cart)
        }
        return cart
    }
}
