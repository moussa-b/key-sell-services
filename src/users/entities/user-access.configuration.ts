import { UserAccess } from './user-access.entity';
import { LabelValue } from '../../shared/dto/label-value.dto';

export class UserAccessConfiguration {
  userAccess: UserAccess; // actual user access
  globalUserAccess: UserAccess; // fields with value false must be hidden in front-end side
  roleUserAccess: UserAccess; // fields with value false must be disabled in front-end side
  groups: UserAccessGroup[];
}

export class UserAccessGroup {
  label: string;
  fields: LabelValue<string>[];
}
