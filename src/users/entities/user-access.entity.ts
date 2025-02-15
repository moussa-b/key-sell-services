import { UserRole } from './user-role.enum';

export class UserAccess {
  canShowCalendarEvents = false;
  canEditCalendarEvents = false;
  canShowUsers = false;
  canEditUsers = false;
  canShowUsersAccess = false;
  canEditUsersAccess = false;
  canShowBuyers = false;
  canEditBuyers = false;
  canShowSellers = false;
  canEditSellers = false;
  canSendEmail = false;

  constructor(props: { [key: string]: any }) {
    // first give accesses with role
    const userRole = props.role;
    if (userRole) {
      switch (userRole) {
        case UserRole.USER:
          this.canShowBuyers = true;
          this.canShowSellers = true;
          break;
        case UserRole.MANAGER:
          this.canShowBuyers = true;
          this.canEditBuyers = true;
          this.canShowSellers = true;
          this.canEditSellers = true;
          this.canSendEmail = true;
          break;
        case UserRole.ADMIN:
          this.canShowBuyers = true;
          this.canEditBuyers = true;
          this.canShowSellers = true;
          this.canEditSellers = true;
          this.canShowUsers = true;
          this.canEditUsers = true;
          this.canShowUsersAccess = true;
          this.canEditUsersAccess = true;
          this.canSendEmail = true;
          break;
      }
    }

    // then give access with specific value
    this.setUserAccess(props, 'canShowCalendarEvents');
    this.setUserAccess(props, 'canEditCalendarEvents');
    this.setUserAccess(props, 'canShowUsers');
    this.setUserAccess(props, 'canEditUsers');
    this.setUserAccess(props, 'canShowBuyers');
    this.setUserAccess(props, 'canEditBuyers');
    this.setUserAccess(props, 'canShowSellers');
    this.setUserAccess(props, 'canEditSellers');
    this.setUserAccess(props, 'canShowUsersAccess');
    this.setUserAccess(props, 'canEditUsersAccess');
  }

  private setUserAccess(obj: { [key: string]: any }, fieldName: string): void {
    if (obj[fieldName] === true || obj[fieldName] === false) {
      this[fieldName] = obj[fieldName];
    }
  }
}
