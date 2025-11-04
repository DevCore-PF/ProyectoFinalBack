import {
  Body,
  Post,
  Headers,
  Req,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { SrvRecord } from 'dns';
import { ApiOperation } from '@nestjs/swagger';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Endpoint protegido para crear la session del pago
   */
  @Post('create-checkout-session')
  @ApiOperation({
    summary: 'Crear sesión de pago',
    description:
      'Genera una sesión de pago con el proveedor de pagos (por ejemplo, Stripe) utilizando los cursos agregados al carrito del usuario autenticado. Devuelve la URL de checkout para completar la transacción.',
  })
  @UseGuards(AuthGuard('jwt'))
  async createCheckoutSession(@Req() req) {
    const userId = req.user.sub;
    return this.paymentsService.createCheckoutSession(userId);
  }

  /**
   * Este endpoint no se protege ya que stripe lo llama para el webhook
   */
  @Post('webhook')
  @ApiOperation({
    summary: 'Webhook de confirmación de pago',
    description:
      'Recibe y procesa las notificaciones automáticas del proveedor de pagos (como Stripe) sobre el estado de las transacciones. Actualiza el estado del pedido o del curso adquirido según el resultado del pago.',
  })
  async handleWebhook(
    @Headers('stripe-signature') signature: string, //la firma de stripe
    @Req() req: Request, //la peticion,
  ) {
    //usamos el req.rawbody gracias a la configuracion del main.ts
    return this.paymentsService.handleWebhook(req['rawBody'], signature);
  }
}
