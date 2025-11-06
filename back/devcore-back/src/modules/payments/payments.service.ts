import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CoursesRepository } from '../course/course.repository';
import { EnrollmentService } from '../enrollments/enrollments.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CartRepository } from '../cart/cart.repository';
import { CartService } from '../cart/cart.service';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly configService: ConfigService,
    private readonly courseRepository: CoursesRepository,
    private readonly enrollmentsService: EnrollmentService,
    private readonly cartService: CartService
  ) {}

  //Crea la sesion para el carrito de compras
  async createCheckoutSession(userId: string){

    //obtenemos el carrito de la base de datos que es del usuario
    const cart = await this.cartService.getOrCreateCart(userId);
    //validamos que exista el carrito y que no este vacio
    if(!cart || !cart.courses || cart.courses.length === 0){
        throw new BadRequestException('Tu carrito esta vacio');
    }

    //extraemos los cursos y id que tiene el carrito
    const courses = cart.courses;
    const courseIds = courses.map(c => c.id)


    //preparamos un ubjeto para establecer los precios de los cursos para el historial de la compra
    const coursePriceMap: Record<string, number> = {};

    //iteramos sobre cada curso del carrito para la lista que stripe mostrara al cobrar
    const line_items = courses.map((course) => {
        const priceInCents = Math.round(course.price * 100); //convertimos los precios a centavos ya eue stripe lo maneja asi

        coursePriceMap[course.id] = priceInCents; //almacenamos el precio en centavos en el map 
        //esto lo leera el webhook

        //retornamos el objeto formado para stripe
        return {price_data: {
            currency: 'usd',
            product_data: {
            name: course.title,
            },
            unit_amount: Math.round(course.price * 100),
        },
                quantity: 1, //definimos que solo se puede comprar 1
    }
    })

    //Creamos la session de pago con toda la info para stripe
    const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        // aqui guardamos el id para saber quien hizo la compra que usuario
        client_reference_id: userId,
        metadata: {
            // guardamos los ids de los cursos para saber cuales compro
            courseIds: JSON.stringify(courseIds),
            prices:JSON.stringify(coursePriceMap),
        },
        line_items: line_items, //este es el arrehlo de cursos que stripe mostrara y cobrara
        //urls a las que stripe redirige al usuario del front
        success_url: `${this.configService.get('FRONTEND_URL')}/payment-success`,
        cancel_url: `${this.configService.get('FRONTEND_URL')}/payment-cancelled`
    })
    //devuelve la url de pago al front
    return {url: session.url}
  }

  /**
   * Maneja el webhook de pago exitoso
   */
  async handleWebhook(buffer: Buffer, signature: string){
    //obtenemos el secreto del webhook(este nos lo devuelve stripe litesn)
    const secret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!secret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }
    let event: Stripe.Event;

    try {
        // Verifica que en la petición venga de Stripe usando la firma y el secreto
        event = this.stripe.webhooks.constructEvent(buffer, signature, secret);
    } catch(err){
        throw new BadRequestException(`Webhook Error: ${err.message}`)
    }

    //Maneja solo el evento completado del pago
    if(event.type === 'checkout.session.completed'){
        const session = event.data.object as Stripe.Checkout.Session;

        //Recupera los ids que guardamos en la metadata
        const userId = session.client_reference_id;

        if (!session.metadata) {
            throw new BadRequestException('No metadata found in session');
        }
        //Recuperamos el mapa de precios desde los metadatos
        const courseIds = JSON.parse(session.metadata.courseIds) as string[];
        const prices = JSON.parse(session.metadata.prices) as Record<string, number>;

        if(!userId || !courseIds){
            throw new BadRequestException('Webhook Error: Faltan metadatos en la sesion')
        }

        //Premaramos los datos de ids y precios
        const enrollmentsData = courseIds.map(id => ({
            courseId: id,
            priceInCents: prices[id] //obtiene el precio en centavos del map
        }))
        //Llama a tu servicio para crear las incripciones
        await this.enrollmentsService.createEnrollmentsForUser(userId, enrollmentsData);

        //vaciamos el carrito
        try {
            await this.cartService.cleanCart(userId)
        } catch (error) {
            console.log(`Error al vaciar el carrito del usuario ${userId}:`, error)
        }
    }
    return {received: true}
  }
}
