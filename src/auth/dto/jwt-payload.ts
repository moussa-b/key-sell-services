import { UserRole } from '../../users/entities/user-role.enum';
import { UserAccess } from '../../users/entities/user-access.entity';

export interface JwtPayload {
  id: number;
  username: string;
  role: UserRole;
  userAccess: UserAccess;
  firstName: string;
  lastName: string;
}
