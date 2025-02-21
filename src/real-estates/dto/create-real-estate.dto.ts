import { IsEnum, IsOptional } from 'class-validator';
import { Address } from '../../shared/models/address.entity';
import { RealEstateType } from '../entities/real-estate-type.enum';

export class CreateRealEstateDto {
  @IsEnum(RealEstateType)
  type: RealEstateType;
  terraced: boolean;
  surface: number;
  roomCount: number;
  showerCount?: number;
  terraceCount?: number;
  hasGarden?: boolean;
  gardenSurface?: number;
  isSecured?: boolean;
  securityDetail?: string;
  facadeCount?: number;
  location?: string;
  price: number;
  priceCurrency: string;
  remark?: string;
  @IsOptional()
  address?: Address;
  owners: number[];
  createdBy?: number;
  updatedBy?: number;
}
