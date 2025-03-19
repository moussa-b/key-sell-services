import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user-role.enum';
import { Sex } from '../../shared/models/user-sex.enum';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(Sex)
  @IsOptional()
  sex: Sex;

  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole;

  @IsString()
  @IsOptional()
  preferredLanguage: string;

  createdBy?: number;

  updatedBy?: number;
}
