import { 
  Controller, 
  Get, 
  Patch, 
  Post,
  Body, 
  UseGuards 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from '../settings/settings.service';
import { CartService } from '../cart/cart.service'; // <-- Importa CartService
import { UpdateCartSettingsDto } from './dto/update-cart-settings.dto';
import { Roles, RolesGuard } from '../auth/guards/verify-role.guard';
import { CartRepository } from '../cart/cart.repository';

@Controller('admin/settings')
@UseGuards(AuthGuard('jwt'), RolesGuard) 
@Roles('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminSettingsController {
  
  constructor(
    private readonly settingsService: SettingsService,
    private readonly cartService: CartService, // <-- Inyéctalo
    private readonly cartRepository: CartRepository,
  ) {}

  /**
   * Endpoint para leer la configuración actual
   */
  @Get('abandoned-cart')
  async getCartSettings() {
    const isEnabled = await this.settingsService.getSetting(
      'ABANDONED_CART_ENABLED', 'false'
    );
    const delayHours = await this.settingsService.getSetting(
      'ABANDONED_CART_DELAY_HOURS', '24'
    );
    return { 
      isEnabled: isEnabled === 'true', 
      delayHours 
    };
  }

  /**
   * Endpoint para actualizar la configuración de frecuencia
   */
  @Patch('abandoned-cart')
async updateCartSettings(@Body() settingsDto: UpdateCartSettingsDto) {
  
  // Solo actualiza 'ENABLED' si el campo fue enviado
  if (settingsDto.isEnabled !== undefined) {
    await this.settingsService.updateSetting(
      'ABANDONED_CART_ENABLED', 
      String(settingsDto.isEnabled)
    );
  }

  // Solo actualiza 'DELAY' si el campo fue enviado
  if (settingsDto.delayHours !== undefined) {
    await this.settingsService.updateSetting(
      'ABANDONED_CART_DELAY_HOURS', 
      settingsDto.delayHours
    );
  }

  return { message: 'Configuración actualizada.' };
}

  /**
   * Endpoint para el botón "Enviar Ahora"
   */
  @Post('trigger-all-reminders')
  async sendAllReminders() {
    return this.cartService.triggerAllAbandonedCartEmails();
  }

  //Endpoint para la vista de ultima vez, cuantos no se les ah enviado. y estado. etc
  @Get('abandoned-cart-dashboard')
  async getDashboardStats(){
    //Obtenemos la configuracion (estado y la frecuencia)
    const isEnabled = await this.settingsService.getSetting('ABANDONED_CART_ENABLED', 'false');
    const delayHours = await this.settingsService.getSetting('ABANDONED_CART_DELAY_HOURS', '24');

    //Obtenemos el ultimo envio de email
    const lastExecution = await this.settingsService.getSetting('ABANDONED_CART_LAST_EXECUTION', '');

    //Obtener el contador de destinatarios
    const pendingCount = await this.cartRepository.countPendingCarts()

    return {
      isEnabled: isEnabled === 'true',  //para ver lo habilitado/inahbilitado
      delayHours: `Cada ${delayHours} horas`, //para el texto de la frecuencia
      delayValue: delayHours, //para el select del modal
      pendingCount: pendingCount, //para el numero pendiente de envios
      lastExecution: lastExecution //para la ultima fecha de envio
    }

  }
}