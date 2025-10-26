import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { UsersModule } from '../users/users.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt'; // <-- 1. Importar
import { MailModule } from 'src/mail/mail.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
  imports:[PassportModule.register({ defaultStrategy: 'jwt' }), // <-- 3. Añadir
    JwtModule.register({ // <-- 4. Añadir y configurar
      global: true, // Opcional: hace el JwtService global
      secret: process.env.JWT_SECRET, // ¡Añade JWT_SECRET a tu .env!
      signOptions: { expiresIn: '1h' },
    }),UsersModule, MailModule]
})
export class AuthModule {}
