import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID:
        configService.get<string>('GOOGLE_CLIENT_ID') ||
        'PLACEHOLDER_NOT_CONFIGURED',
      clientSecret:
        configService.get<string>('GOOGLE_CLIENT_SECRET') ||
        'PLACEHOLDER_NOT_CONFIGURED',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, displayName, emails } = profile;
    const user = await this.authService.validateGoogleUser({
      providerId: id,
      nombre: displayName,
      correo: emails[0].value,
    });
    done(null, user);
  }
}
