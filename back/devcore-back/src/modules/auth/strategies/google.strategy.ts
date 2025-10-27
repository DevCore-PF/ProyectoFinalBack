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
      scope: ['email', 'profile'], // Pedimos el email y el perfil como lo asignamos el cloud
      passReqToCallback: false
    });
  }


  /**
   * Método Validate
   * Este método se ejecuta DESPUÉS de que Google verifica al usuario
   * y nos devuelve el perfil en el 'callbackURL'.
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    
    // destructuramos los datos del perfil del usuario de google
    const { id, name, emails, photos } = profile;

    //creamos nuestro dto para el registro
    const googleUserDto: GoogleUserDto = {
      googleId: id,
      email: emails?.[0]?.value ?? 'no-email@google.com', // Valor por defecto
      name: name?.givenName ?? 'Usuario', // Valor por defecto
      image: photos?.[0]?.value || undefined,
    };

    // Llamamos al metodo validate

    const user = await this.authService.validateAndHandleGoogleUser(googleUserDto);

    return user;   }
}