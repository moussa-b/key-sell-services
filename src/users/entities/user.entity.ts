import { Sex } from '../../shared/models/user-sex.enum';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { UserRole } from './user-role.enum';

export class User {
  id: number;
  uuid: number;
  @ApiHideProperty()
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  sex: Sex;
  preferredLanguage?: string;
  @ApiProperty({ enum: ['ADMIN', 'MANAGER', 'USER'] })
  role: UserRole;
  isActive: boolean;
  @ApiHideProperty()
  activationToken?: string;
  @ApiHideProperty()
  resetPasswordToken?: string;
  @ApiHideProperty()
  resetPasswordExpires?: Date;
  createdBy?: number;
  createdAt: Date;
  updatedBy?: number;
  updatedAt?: Date;
}
