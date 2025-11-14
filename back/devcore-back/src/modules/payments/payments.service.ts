import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CoursesRepository } from '../course/course.repository';
import { EnrollmentService } from '../enrollments/enrollments.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CartRepository } from '../cart/cart.repository';
import { CartService } from '../cart/cart.service';
import { PaymentRepository } from './payments.repository';
import { UsersRepository } from '../users/users.repository';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly configService: ConfigService,
    private readonly enrollmentsService: EnrollmentService,
    private readonly cartService: CartService,
    private readonly paymentRepository: PaymentRepository,
    private readonly usersRepository: UsersRepository,
    private readonly courseRepository: CoursesRepository,
    private readonly mailService: MailService,
  ) {}

  private readonly logger = new Logger(PaymentsService.name);

  //Crea la sesion para el carrito de compras
  async createCheckoutSession(userId: string) {
    //obtenemos el carrito de la base de datos que es del usuario
    const cart = await this.cartService.getOrCreateCart(userId);
    //validamos que exista el carrito y que no este vacio
    if (!cart || !cart.courses || cart.courses.length === 0) {
      throw new BadRequestException('Tu carrito esta vacio');
    }

    //extraemos los cursos y id que tiene el carrito
    const courses = cart.courses;
    const courseIds = courses.map((c) => c.id);

    //preparamos un ubjeto para establecer los precios de los cursos para el historial de la compra
    const coursePriceMap: Record<string, number> = {};

    //iteramos sobre cada curso del carrito para la lista que stripe mostrara al cobrar
    const line_items = courses.map((course) => {
      const priceInCents = Math.round(course.price * 100); //convertimos los precios a centavos ya eue stripe lo maneja asi

      coursePriceMap[course.id] = priceInCents; //almacenamos el precio en centavos en el map
      //esto lo leera el webhook

      //retornamos el objeto formado para stripe
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: course.title,
          },
          unit_amount: Math.round(course.price * 100),
        },
        quantity: 1, //definimos que solo se puede comprar 1
      };
    });

    //Creamos la session de pago con toda la info para stripe
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      // aqui guardamos el id para saber quien hizo la compra que usuario
      client_reference_id: userId,
      metadata: {
        // guardamos los ids de los cursos para saber cuales compro
        courseIds: JSON.stringify(courseIds),
        prices: JSON.stringify(coursePriceMap),
      },
      line_items: line_items, //este es el arrehlo de cursos que stripe mostrara y cobrara
      //urls a las que stripe redirige al usuario del front
      success_url: `${this.configService.get('FRONTEND_URL')}/payment-success`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/payment-cancelled`,
    });
    //devuelve la url de pago al front
    return { url: session.url };
  }

  /**
   * Maneja el webhoom de pago exitoso
   */
  async handleWebhook(buffer: Buffer, signature: string) {
    const secret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!secret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(buffer, signature, secret);
    } catch (err) {
      this.logger.error(
        `Webhook signature verification failed: ${err.message}`,
      );
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`[Stripe Webhook] Evento recibido: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      this.logger.log(
        '[Stripe Webhook] Procesando checkout.session.completed...',
      );
      const session = event.data.object as Stripe.Checkout.Session;

      // 1. Obtiene los detalles completos del pago (para la tarjeta)
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        session.payment_intent as string,
        { expand: ['payment_method'] },
      );

      const userId = session.client_reference_id;
      const metadata = session.metadata;

      if (!metadata) {
        this.logger.error(
          '[Stripe Webhook] ¡ERROR! No hay metadatos en la sesión.',
        );
        throw new BadRequestException('No metadata found in session');
      }

      const courseIds = JSON.parse(metadata.courseIds) as string[];
      const prices = JSON.parse(metadata.prices) as Record<string, number>;

      if (!userId || !courseIds || !prices) {
        this.logger.error(
          '[Stripe Webhook] ¡ERROR! Faltan metadatos (userId, courseIds, o prices).',
        );
        throw new BadRequestException(
          'Webhook Error: Faltan metadatos en la sesion',
        );
      }

      this.logger.log(`[Stripe Webhook] Datos recuperados: UserID: ${userId}`);

      // ¡AQUÍ ESTÁ LA LÓGICA CRÍTICA!
      try {
        // --- TAREA 2: GUARDAR EL PAGO (HACER ESTO PRIMERO) ---
        this.logger.log('[Stripe Webhook] Guardando la transacción...');
        const newPayment = this.paymentRepository.create({
          stripeId: paymentIntent.id,
          user: { id: userId },
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          cardBrand: (paymentIntent.payment_method as any).card.brand,
          cardLast4: (paymentIntent.payment_method as any).card.last4,
        });
        // Guarda el pago y obtén la entidad guardada (con su ID)
        const savedPayment = await this.paymentRepository.save(newPayment);
        this.logger.log(
          `[Stripe Webhook] Transacción ${savedPayment.id} guardada.`,
        );

        // --- Prepara los datos para las inscripciones ---
        const enrollmentsData = courseIds.map((id) => ({
          courseId: id,
          priceInCents: prices[id],
          paymentId: savedPayment.id, // <-- ¡Ahora SÍ pasas el ID del pago!
        }));

        // --- Crea las inscripciones ---
        this.logger.log('[Stripe Webhook] Intentando crear inscripciones...');
        await this.enrollmentsService.createEnrollmentsForUser(
          userId,
          enrollmentsData,
        );
        this.logger.log(
          '[Stripe Webhook] ¡Inscripciones creadas exitosamente!',
        );

        // --- Vacía el carrito ---
        this.logger.log('[Stripe Webhook] Intentando vaciar el carrito...');
        await this.cartService.clearCart(userId);
        this.logger.log(
          `[Stripe Webhook] Carrito vaciado para Usuario ID: ${userId}`,
        );

        // --- TAREA 1: ENVIAR EMAIL DE CONFIRMACIÓN ---
        this.logger.log('[Stripe Webhook] Enviando email de confirmación...');
        const user = await this.usersRepository.findUserById(userId);
        const courses = await this.courseRepository.findCoursesByIds(courseIds);

        await this.mailService.sendPurchaseConfirmation(
          user,
          savedPayment,
          courses,
        );
        this.logger.log('[Stripe Webhook] ¡Email enviado!');
      } catch (error) {
        this.logger.error(
          '[Stripe Webhook] ¡ERROR CRÍTICO al procesar la base de datos!:',
          error.stack,
        );
        throw new InternalServerErrorException(
          'Error al procesar la inscripción en la base de datos.',
        );
      }
    }

    return { received: true };
  }

  async getPaymentsByUser(userId: string) {
    try {
      const payments = await this.paymentRepository.find({
        where: { user: { id: userId } },
        relations: ['enrollments', 'enrollments.course'],
        order: { createdAt: 'DESC' },
      });

      return payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount / 100, // Convertir de centavos a dólares
        currency: payment.currency,
        status: payment.status,
        cardBrand: payment.cardBrand,
        cardLast4: payment.cardLast4,
        createdAt: payment.createdAt,
        courses:
          payment.enrollments?.map((enrollment) => ({
            id: enrollment.course.id,
            title: enrollment.course.title,
            price: enrollment.priceAtPurchase,
          })) || [],
      }));
    } catch (error) {
      this.logger.error('Error al obtener historial de pagos:', error);
      throw new InternalServerErrorException(
        'Error al obtener el historial de pagos',
      );
    }
  }
}
