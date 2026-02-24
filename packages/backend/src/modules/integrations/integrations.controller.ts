import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/user.entity';

@Controller('brand/integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BRAND)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  /** GET /brand/integrations — get current integration config (tokens masked) */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getIntegrations(@CurrentUser() user: User) {
    const brandId = user.brand?.id;
    if (!brandId) {
      return { success: false, message: 'Brand profile not found' };
    }

    const integration = await this.integrationsService.getMaskedIntegration(brandId);
    return { success: true, data: integration };
  }

  /** PUT /brand/integrations — save Meta + GA4 credentials */
  @Put()
  @HttpCode(HttpStatus.OK)
  async updateIntegrations(
    @CurrentUser() user: User,
    @Body() dto: UpdateIntegrationDto,
  ) {
    const brandId = user.brand?.id;
    if (!brandId) {
      return { success: false, message: 'Brand profile not found' };
    }

    const integration = await this.integrationsService.updateIntegration(brandId, dto);
    return { success: true, data: integration };
  }

  /** GET /brand/integrations/pixel — get personalized JS pixel snippet */
  @Get('pixel')
  @HttpCode(HttpStatus.OK)
  async getPixelSnippet(@CurrentUser() user: User) {
    const brandId = user.brand?.id;
    if (!brandId) {
      return { success: false, message: 'Brand profile not found' };
    }

    const snippet = await this.integrationsService.generatePixelSnippet(brandId);
    return { success: true, data: { snippet } };
  }

  /** POST /brand/integrations/test-meta — fire a test event to Meta CAPI */
  @Post('test-meta')
  @HttpCode(HttpStatus.OK)
  async testMeta(@CurrentUser() user: User) {
    const brandId = user.brand?.id;
    if (!brandId) {
      return { success: false, message: 'Brand profile not found' };
    }

    const result = await this.integrationsService.testMetaConnection(brandId);
    return { success: result.success, data: { message: result.message } };
  }

  /** POST /brand/integrations/test-ga4 — fire a test event to GA4 */
  @Post('test-ga4')
  @HttpCode(HttpStatus.OK)
  async testGA4(@CurrentUser() user: User) {
    const brandId = user.brand?.id;
    if (!brandId) {
      return { success: false, message: 'Brand profile not found' };
    }

    const result = await this.integrationsService.testGA4Connection(brandId);
    return { success: result.success, data: { message: result.message } };
  }
}
