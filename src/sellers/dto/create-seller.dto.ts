import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Sex } from '../../shared/models/user-sex.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Address } from '../../shared/models/address.entity';

export class CreateSellerDto {
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

  @IsOptional()
  address?: Address;

  @IsString()
  @IsOptional()
  preferredLanguage: string;

  createdBy?: number;

  updatedBy?: number;
}
