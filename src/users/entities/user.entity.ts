import { Sex } from '../../shared/models/user-sex.enum';
import { UserRole } from './user-role.enum';
import { UserAccess } from './user-access.entity';

export class User {
  id: number;
  uuid: number;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  sex: Sex;
  preferredLanguage?: string;
  role: UserRole;
  isActive: boolean;
  activationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdBy?: number;
  createdAt: Date;
  updatedBy?: number;
  updatedAt?: Date;
  userAccess?: UserAccess;
}
