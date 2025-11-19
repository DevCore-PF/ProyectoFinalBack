import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { SettingsService } from './settings.service';

@Global() // <-- ¡Importante! Hace que SettingsService esté disponible en toda la app
@Module({
  imports: [
    TypeOrmModule.forFeature([Setting]), // 1. Registra la entidad 'Setting'
  ],
  providers: [SettingsService], // 2. Declara el servicio
  exports: [SettingsService], // 3. Exporta el servicio para que otros módulos lo usen
})
export class SettingsModule {}