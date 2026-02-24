import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../users/user.entity';

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  id_token: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
