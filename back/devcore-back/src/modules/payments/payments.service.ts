import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CoursesRepository } from '../course/course.repository';
import { EnrollmentService } from '../enrollments/enrollments.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly configService: ConfigService,
    private readonly courseRepository: CoursesRepository,
    private readonly enrollmentsService: EnrollmentService,
  ) {}

  //Crea la sesion para el carrito de compras
  async createCheckoutSession(userId: string, createCheckoutDto: CreateCheckoutDto){
    const {courseIds} = createCheckoutDto;

    //busca los cursos en la base de datos y obtener sus precioes reales
    const courses = await this.courseRepository.findCoursesByIds(courseIds);
    if(courses.length !== courseIds.length){
        throw new NotFoundException('Uno o mas cursos no fueron encontrados')
    }

    //convierte los cursos al forma que stripe entienda
    const line_items = courses.map((course) => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: course.title,
            },
            unit_amount: Math.round(course.price * 100),
        },
        quantity: 1,
    }));

    //Creamos la session de pago
    const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        //importante aqui guardamos el id para saber quien hizo la compra que usuario
        client_reference_id: userId,
        metadata: {
            //importante guardamos los ids de los cursos para saber cuales compro
            courseIds: JSON.stringify(courseIds),
        },
        line_items: line_items, //este es el arrehlo de cursos
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
        const courseIds = JSON.parse(session.metadata.courseIds) as string[];

        if(!userId || !courseIds){
            throw new BadRequestException('Webhook Error: Faltan metadatos en la sesion')
        }

        //Llama a tu servicio para crear las incripciones
        await this.enrollmentsService.createEnrollmentsForUSer(userId, courseIds);
    }
    return {received: true}
  }
}
