import { Body, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { PayoutService } from "./payouts.service";
import { AuthGuard } from "@nestjs/passport";
import { Roles, RolesGuard } from "../auth/guards/verify-role.guard";

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class PayoutController {
    constructor(private readonly payoutService: PayoutService) {}

    /**
     * Endpoint para traer los pagos pendientes
     */
    @Get('pending-summary')
    async getPendingSummary(){
        return this.payoutService.getPendingPayoutSummary();
    }

    //Crear lote de pago 
    @Post('create-batch/:professorId')
    async createBatch(@Param('professorId', ParseUUIDPipe) professorId: string) {
        return this.payoutService.createPayoutBatch(professorId)
    }

    /**
     * Endpoint para marcar como pagado pasando la referencia
     */
    @Patch('mark-paid/:payoutId')
    async markAsPaid(@Param('payoutId', ParseUUIDPipe) payoutId: string, @Body('referenceNumber') referenceNumber: string){
        return this.payoutService.markPayoutAsPaid(payoutId, referenceNumber)
    }
}