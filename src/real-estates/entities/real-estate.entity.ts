import { RealEstateType } from './real-estate-type.enum';
import { Address } from '../../shared/models/address.entity';
import { RealEstateStatus } from './real-estate-status.enum';

export class RealEstate {
  id: number;
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
  address: Address;
  owners: number[];
  status: RealEstateStatus;
  statusRemark: string;
  createdBy?: number;
  createdAt: Date;
  updatedBy?: number;
  updatedAt?: Date;
}
