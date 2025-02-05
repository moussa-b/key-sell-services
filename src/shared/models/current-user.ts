import { UserRole } from '../../users/entities/user-role.enum';

export class ConnectedUser {
  id: number;
  role?: UserRole;
  username?: string;
}
