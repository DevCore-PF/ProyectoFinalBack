import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') { // 1. Nómbrala 'jwt'
  
  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    super({
      //Le dice que busque el token en la cabecera 'Authorization: Bearer'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // No debe ignorar la expiración (passport lo maneja por nosotros)
      ignoreExpiration: false,
      
      //Usa el MISMO secret que usaste para firmar el token en auth.service.ts
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  /**
   * Este método se ejecuta despues de que el token es verificado.
   * Recibe el 'payload' que guardamos en el token.
   */
  async validate(payload: any) {
    // Lo que retornemos aquí, Passport lo adjuntará a 'req.user'
    return { 
      sub: payload.sub, 
      email: payload.email,
      role: payload.role,
      hasCompletedProfile: payload.hasCompletedProfile
    };
  }
}