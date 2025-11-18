import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SettingsService {
  constructor(
    // Inyecta el repositorio para la entidad 'Setting'
    @InjectRepository(Setting)
    private readonly settingsRepository: Repository<Setting>,
  ) {}

  /**
   * Obtiene un valor de configuración de la BD.
   * Si no lo encuentra, devuelve el 'defaultValue'.
   */
  async getSetting(key: string, defaultValue: string): Promise<string> {
    const setting = await this.settingsRepository.findOneBy({ key });
    return setting ? setting.value : defaultValue;
  }

  /**
   * Actualiza (o crea) un valor de configuración en la BD.
   */
  async updateSetting(key: string, value: string): Promise<Setting> {
    // Intenta encontrar la configuración
    let setting = await this.settingsRepository.findOneBy({ key });

    if (!setting) {
      // Si no existe, la crea
      setting = this.settingsRepository.create({ key, value });
    } else {
      // Si existe, la actualiza
      setting.value = value;
    }
    
    // Guarda los cambios (sea crear o actualizar)
    return this.settingsRepository.save(setting);
  }
}