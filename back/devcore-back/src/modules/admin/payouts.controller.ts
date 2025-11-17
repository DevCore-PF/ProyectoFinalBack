import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { PayoutService } from "./payouts.service";
import { AuthGuard } from "@nestjs/passport";
import { Roles, RolesGuard } from "../auth/guards/verify-role.guard";
import { PayoutStatus } from "./enums/PayoutStatus.enum";

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('admin/payouts')
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

    
    /**
     * Obtiene todas las ventas
     */
    @Get('sales/all')
    async getAllSales() {
        return this.payoutService.getSalesHistory('ALL')
    }

    /**
     * Obtiene solo las ventas pendientes de pago
     */
    @Get('sales/pending')
    async getPendingSale() {
        return this.payoutService.getSalesHistory('PENDING')
    }

    /**
     * Obtiene solo las ventas que ya fueron pagadas
     */
    @Get('sales/paid')
    async getPaidSales(){
        return this.payoutService.getSalesHistory('PAID')
    }

    /**
     * Obtiene TODOS los lotes de pago (Pagados y Pendientes)
     */
    @Get('batches/all')
    async getAllBatches() {
        return this.payoutService.getPayoutBatches(); // Sin filtro
    }

    /**
     * Obtiene solo lotes PENDIENTES
     */
    @Get('batches/pending')
    async getPendingBatches() {
        return this.payoutService.getPayoutBatches(PayoutStatus.PENDING);
    }

    /**
     * Obtiene solo lotes YA PAGADOS
     */
    @Get('batches/paid')
    async getPaidBatches() {
        return this.payoutService.getPayoutBatches(PayoutStatus.PAID);
    }
}