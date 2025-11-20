import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PayoutService } from './payouts.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '../auth/guards/verify-role.guard';
import { PayoutStatus } from './enums/PayoutStatus.enum';
import { ApiGetPendingPayoutSummaryDoc } from './doc/getPendingSumarry.doc';
import { ApiCreatePayoutBatchDoc } from './doc/createPayountBatch.doc';
import { ApiMarkPayoutAsPaidDoc } from './doc/markPayoutAsPaid.doc';
import { ApiGetAllSalesDoc } from './doc/getAllSales.doc';
import { ApiGetPendingSalesDoc } from './doc/getPendigSales.doc';
import { ApiGetPaidSalesDoc } from './doc/getPaidSales.doc';
import { ApiGetAllBatchesDoc } from './doc/getAllBatches.doc';
import { ApiGetPendingBatchesDoc } from './doc/getPendingBatches.doc';
import { ApiGetPaidBatchesDoc } from './doc/getPaidBatches.doc';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('admin/payouts')
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  /**
   * Endpoint para traer los pagos pendientes
   */
  @Get('pending-summary')
  @ApiGetPendingPayoutSummaryDoc()
  async getPendingSummary() {
    return this.payoutService.getPendingPayoutSummary();
  }

  //Crear lote de pago
  @Post('create-batch/:professorId')
  @ApiCreatePayoutBatchDoc()
  async createBatch(@Param('professorId', ParseUUIDPipe) professorId: string) {
    return this.payoutService.createPayoutBatch(professorId);
  }

  /**
   * Endpoint para marcar como pagado pasando la referencia
   */
  @Patch('mark-paid/:payoutId')
  @ApiMarkPayoutAsPaidDoc()
  async markAsPaid(
    @Param('payoutId', ParseUUIDPipe) payoutId: string,
    @Body('referenceNumber') referenceNumber: string,
  ) {
    return this.payoutService.markPayoutAsPaid(payoutId, referenceNumber);
  }

  /**
   * Obtiene todas las ventas
   */

  @Get('sales/all')
  @ApiGetAllSalesDoc()
  async getAllSales() {
    return this.payoutService.getSalesHistory('ALL');
  }

  /**
   * Obtiene solo las ventas pendientes de pago
   */
  @Get('sales/pending')
  @ApiGetPendingSalesDoc()
  async getPendingSale() {
    return this.payoutService.getSalesHistory('PENDING');
  }

  /**
   * Obtiene solo las ventas que ya fueron pagadas
   */
  @Get('sales/paid')
  @ApiGetPaidSalesDoc()
  async getPaidSales() {
    return this.payoutService.getSalesHistory('PAID');
  }

  /**
   * Obtiene TODOS los lotes de pago (Pagados y Pendientes)
   */
  @Get('batches/all')
  @ApiGetAllBatchesDoc()
  async getAllBatches() {
    return this.payoutService.getPayoutBatches(); // Sin filtro
  }

  /**
   * Obtiene solo lotes PENDIENTES
   */
  @Get('batches/pending')
  @ApiGetPendingBatchesDoc()
  async getPendingBatches() {
    return this.payoutService.getPayoutBatches(PayoutStatus.PENDING);
  }

  /**
   * Obtiene solo lotes YA PAGADOS
   */
  @Get('batches/paid')
  @ApiGetPaidBatchesDoc()
  async getPaidBatches() {
    return this.payoutService.getPayoutBatches(PayoutStatus.PAID);
  }
}
