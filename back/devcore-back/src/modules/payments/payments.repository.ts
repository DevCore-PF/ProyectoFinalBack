import { InjectRepository } from "@nestjs/typeorm";
import { Payment } from "./entities/payment.entity";
import { DeepPartial, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PaymentRepository {
    constructor(@InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>){}

    /**
     * Metodo crea una instancia de payment
     */
    create(paymentData: DeepPartial<Payment>): Payment{
        return this.paymentRepository.create(paymentData);
    }

    /**
     * Guarda una entidad de payment en la base de datos
     */
    save(payment: Payment): Promise<Payment>{
        return this.paymentRepository.save(payment);
    }

    /**
     * Busca un pago por el id de la transaccion de stripe
     */
    async findByStripeID(stripeId: string): Promise<Payment | null> {
        return this.paymentRepository.findOneBy({stripeId: stripeId})
    }

    /**
     * Busca todos los pagos de un usuario
     */
    async findByUserId(userId: string): Promise<Payment[]> {
        return this.paymentRepository.find({
            where: {user: {id: userId}},
            order: {createdAt: 'DESC'}
        });
    }
}