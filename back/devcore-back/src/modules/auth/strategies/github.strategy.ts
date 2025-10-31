// auth/strategies/github.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    const { id, username, emails, photos } = profile;

    const githubUserDto = {
      githubId: id, // Aunque es GitHub, el campo sirve igual
      email: emails?.[0]?.value ?? `${username}@github.user`,
      name: username ?? 'Usuario GitHub',
      image: photos?.[0]?.value,
    };

    const user =
      await this.authService.validateAndHandleGitHubUser(githubUserDto);
    return user;
  }
}