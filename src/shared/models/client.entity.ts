import { Sex } from './user-sex.enum';
import { Address } from './address.entity';

export class Client {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sex?: Sex;
  preferredLanguage?: string;
  address?: Address;
  createdBy?: number;
  createdAt: Date;
  updatedBy?: number;
  updatedAt?: Date;
  userId?: number;
}
