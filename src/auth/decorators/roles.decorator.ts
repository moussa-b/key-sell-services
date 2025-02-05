import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user-role.enum';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
