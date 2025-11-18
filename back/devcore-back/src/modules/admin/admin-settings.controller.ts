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

@Controller('admin/settings')
@UseGuards(AuthGuard('jwt'), RolesGuard) 
@Roles('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminSettingsController {
  
  constructor(
    private readonly settingsService: SettingsService,
    private readonly cartService: CartService, // <-- Inyéctalo
  ) {}

  /**
   * Endpoint para leer la configuración actual (Puntos 1 y 2)
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
   * Endpoint para actualizar la configuración (Puntos 1 y 2)
   */
  @Patch('abandoned-cart')
  async updateCartSettings(@Body() settingsDto: UpdateCartSettingsDto) {
    await this.settingsService.updateSetting(
      'ABANDONED_CART_ENABLED', 
      String(settingsDto.isEnabled) // "true" o "false"
    );
    await this.settingsService.updateSetting(
      'ABANDONED_CART_DELAY_HOURS', 
      settingsDto.delayHours // "24", "48", "72"
    );
    return { message: 'Configuración actualizada.' };
  }

  /**
   * Endpoint para el botón "Enviar Ahora" (Punto 4)
   * (Lo ponemos en un controlador separado por claridad)
   */
  // Este controlador puede vivir en 'src/admin/admin-cart.controller.ts'
  @Post('trigger-all-reminders')
  async sendAllReminders() {
    return this.cartService.triggerAllAbandonedCartEmails();
  }
}