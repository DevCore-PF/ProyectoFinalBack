import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { CartRepository } from '../cart/cart.repository';
import { SettingsService } from '../settings/settings.service';
import { Cart } from '../cart/entities/cart.entity';
import { LessThan } from 'typeorm'; // <-- Asegúrate de importar LessThan
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly mailService: MailService,
    private readonly settingsService: SettingsService,
  ) {}

  /**
   * Cron Job para carritos abandonados.
   * Se ejecuta una vez CADA HORA, todos los días.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleAbandonedCarts() {
    this.logger.log('Iniciando Cron Job: Buscando carritos abandonados...');

    // 1. Revisa si la función está activada
    const isEnabled = await this.settingsService.getSetting(
      'ABANDONED_CART_ENABLED', 
      'false'
    );
    if (isEnabled === 'false') {
      this.logger.log('[Cron: Carritos] La función está desactivada por el Admin.');
      return;
    }
    
    // 2. Obtiene el retraso (ej. "24") de la BD
    const delayHoursStr = await this.settingsService.getSetting(
      'ABANDONED_CART_DELAY_HOURS', 
      '24'
    );
    const delayHours = parseInt(delayHoursStr, 10);
    this.logger.log(`[Cron: Carritos] Usando un retraso de ${delayHours} horas.`);

    // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
    // 3. Calcula la fecha "límite" (solo un valor)
    const now = new Date();
    const timeLimit = new Date();
    timeLimit.setHours(now.getHours() - delayHours);

    // 4. Llama al método del repositorio con UN SOLO argumento
    const cartsToNotify = await this.cartRepository.findCartsToNotify(
      timeLimit,
    );
    // --- FIN DE LA CORRECCIÓN ---
    
    // 5. Filtra los que están vacíos (doble chequeo)
    const abandonedCarts = cartsToNotify.filter(
      (cart) => cart.user && cart.courses && cart.courses.length > 0
    );

    if (abandonedCarts.length === 0) {
      this.logger.log('[Cron: Carritos] No se encontraron carritos que cumplan los requisitos.');
      return;
    }

    this.logger.log(`[Cron: Carritos] ${abandonedCarts.length} carritos encontrados. Enviando emails...`);

    // 6. Itera, envía y prepara para guardar
    const updatedCarts: Cart[] = [];
    for (const cart of abandonedCarts) {
      try {
        await this.mailService.sendAbandonedCartEmail(
          cart.user.email,
          cart.user.name,
          cart.courses,
        );
        cart.notificationSent = true;
        updatedCarts.push(cart);
      } catch (error) {
        this.logger.error(
          `[Cron: Carritos] Falló el envío de email a ${cart.user.email}`,
          error.stack,
        );
      }
    }
    
    // 7. Guarda todos los carritos actualizados
    if (updatedCarts.length > 0) {
      await this.cartRepository.save(updatedCarts);
      this.logger.log(`[Cron: Carritos] ${updatedCarts.length} carritos marcados como 'notificados'.`);

      await this.settingsService.updateSetting('ABANDONED_CART_DELAY_HOURS', new Date().toString())
    }
  }
}