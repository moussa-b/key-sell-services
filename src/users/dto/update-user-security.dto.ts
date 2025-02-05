import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserSecurityDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsOptional()
  newPassword: string;

  @IsString()
  @IsOptional()
  confirmPassword: string;
}
