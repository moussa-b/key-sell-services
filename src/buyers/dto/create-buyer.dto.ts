import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Sex } from '../../shared/models/user-sex.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBuyerDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsEnum(Sex)
  @IsOptional()
  @ApiProperty({ enum: ['M', 'F'] })
  sex: Sex;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  preferredLanguage: string;

  createdBy?: number;

  updatedBy?: number;
}
