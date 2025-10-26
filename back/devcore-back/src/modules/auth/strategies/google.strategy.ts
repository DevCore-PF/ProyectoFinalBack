import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { GoogleUserDto } from '../dto/google-user.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  
  constructor(
    private readonly authService: AuthService,
  ) {

    super({
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
      scope: ['email', 'profile'], // Pedimos el email y el perfil
      passReqToCallback: false
    });
  }


  /**
   * 2. Método Validate
   * Este método se ejecuta DESPUÉS de que Google verifica al usuario
   * y nos devuelve el perfil en el 'callbackURL'.
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    // done: VerifyCallback, <-- 1. ¡ESTO NO DEBE ESTAR AQUÍ!
  ): Promise<any> {
    
    // 3. Extracción de datos del perfil de Google
    const { id, name, emails, photos } = profile;

    // 4. Creamos nuestro DTO
    // (Tus correcciones con '??' y '||' están muy bien)
    const googleUserDto: GoogleUserDto = {
      googleId: id,
      email: emails?.[0]?.value ?? 'no-email@google.com', // Valor por defecto
      name: name?.givenName ?? 'Usuario', // Valor por defecto
      image: photos?.[0]?.value || undefined, // Use undefined instead of null
    };

    // 5. ¡AQUÍ ESTÁ LA MAGIA!
    // (Este error rojo es normal, lo arreglamos en el siguiente paso)
    const user = await this.authService.validateAndHandleGoogleUser(googleUserDto);

    // 6. ¡ASÍ SE HACE EN NESTJS!
    return user; 
    // done(null, user); <-- 2. ¡ESTO TAMPOCO SE USA!
  }
}