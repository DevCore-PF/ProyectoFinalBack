import { Body, Post,Headers, Req, UseGuards, Controller } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { AuthGuard } from "@nestjs/passport";
import { CreateCheckoutDto } from "./dto/create-checkout.dto";
import { SrvRecord } from "dns";

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService){}

    /**
     * Endpoint protegido para crear la session del pago
     */
    @Post('create-checkout-session')
    @UseGuards(AuthGuard('jwt'))
    async createCheckoutSession(
        @Req() req,
        @Body() createCheckoutDto: CreateCheckoutDto
    ){
        const userId = req.user.sub;
        return this.paymentsService.createCheckoutSession(userId, createCheckoutDto)
    }

    /**
     * Este endpoint no se protege ya que stripe lo llama para el webhook
     */
    @Post('webhook')
    async handleWebhook(
        @Headers('stripe-signature') signature: string, //la firma de stripe
        @Req() req: Request, //la peticion,
    ){
        //usamos el req.rawbody gracias a la configuracion del main.ts
        return this.paymentsService.handleWebhook(req['rawBody'], signature)
    }
}