// auth/strategies/github.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { SocialProfileDto } from '../dto/socialProfile.dto';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email'],
      passReqToCallback: true
    });
  }


  async validate(req: Request, ...args: any[]): Promise<any>{
    const [accessToken, refreshToken, profile] = args;

    const state = JSON.parse(req.query.state as string);
    const action = state.action as 'login' | 'register';

    const {id, name, emails, photos} = profile;
    const socialProfile: SocialProfileDto = {
      provider: 'github',
      providerId: id,
      email: emails?.[0]?.value,
      name: name?.givenName || emails[0].value.split('@')[0],
      image: photos?.[0]?.value
    }

    return this.authService.validateAndHandleSocialUser(socialProfile, action)

  }
}