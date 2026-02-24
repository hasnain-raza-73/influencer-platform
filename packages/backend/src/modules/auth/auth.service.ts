import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '../users/user.entity';
import { Brand } from '../brands/brand.entity';
import { Influencer } from '../influencers/influencer.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(Influencer)
    private influencerRepository: Repository<Influencer>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      email,
      password_hash,
      role,
    });

    await this.userRepository.save(user);

    // Create role-specific profile
    if (role === UserRole.BRAND) {
      const brand = this.brandRepository.create({
        user_id: user.id,
        company_name: email.split('@')[0], // Default company name
        api_key: this.generateApiKey(),
        pixel_id: this.generatePixelId(),
      });
      await this.brandRepository.save(brand);
    } else if (role === UserRole.INFLUENCER) {
      const influencer = this.influencerRepository.create({
        user_id: user.id,
        display_name: email.split('@')[0], // Default display name
      });
      await this.influencerRepository.save(influencer);
    }

    // Fetch user with relations for the response
    const userWithRelations = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['brand', 'influencer'],
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    const sanitized = this.sanitizeUser(userWithRelations || user);
    const { brand, influencer, ...userWithoutRelations } = sanitized as any;

    return {
      user: userWithoutRelations,
      brand: brand || null,
      influencer: influencer || null,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user with basic info first for password check
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is suspended or deleted');
    }

    // Fetch user with relations for the response
    const userWithRelations = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['brand', 'influencer'],
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    const sanitized = this.sanitizeUser(userWithRelations || user);
    const { brand, influencer, ...userWithoutRelations } = sanitized as any;

    return {
      user: userWithoutRelations,
      brand: brand || null,
      influencer: influencer || null,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const tokens = await this.generateTokens(user);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['brand', 'influencer'],
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  async googleAuth(idToken: string, role?: UserRole) {
    // TODO: Implement Google OAuth validation
    // This requires verifying the ID token with Google
    // For now, throwing an error
    throw new BadRequestException('Google OAuth not yet implemented');
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  private sanitizeUser(user: User) {
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }

  private generateApiKey(): string {
    return `sk_${uuidv4().replace(/-/g, '')}`;
  }

  private generatePixelId(): string {
    return `px_${uuidv4().replace(/-/g, '').substring(0, 24)}`;
  }
}
