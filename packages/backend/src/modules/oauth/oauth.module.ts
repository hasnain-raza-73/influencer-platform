import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { SocialIntegrationsModule } from '../social-integrations/social-integrations.module';

@Module({
  imports: [ConfigModule, SocialIntegrationsModule],
  controllers: [OAuthController],
  providers: [OAuthService],
  exports: [OAuthService],
})
export class OAuthModule {}
