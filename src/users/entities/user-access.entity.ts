import { UserRole } from './user-role.enum';

export class UserAccess {
  canEditBuyers = false;
  canEditCalendarEvents = false;
  canEditRealEstate = false;
  canEditSellers = false;
  canEditUsers = false;
  canEditUsersAccess = false;
  canSendEmail = false;
  canShowBuyers = false;
  canShowCalendarEvents = false;
  canShowRealEstate = false;
  canShowSellers = false;
  canShowUsers = false;
  canShowUsersAccess = false;

  constructor(props: { [key: string]: any }) {
    // first give accesses with role
    const userRole = props.role;
    if (userRole) {
      switch (userRole) {
        case UserRole.USER:
          this.canShowBuyers = true;
          this.canShowCalendarEvents = true;
          this.canShowRealEstate = true;
          this.canShowSellers = true;
          break;
        case UserRole.MANAGER:
          this.canEditBuyers = true;
          this.canEditCalendarEvents = true;
          this.canEditRealEstate = true;
          this.canEditSellers = true;
          this.canSendEmail = true;
          this.canShowBuyers = true;
          this.canShowCalendarEvents = true;
          this.canShowRealEstate = true;
          this.canShowSellers = true;
          this.canShowUsers = true;
          this.canShowUsersAccess = true;
          break;
        case UserRole.ADMIN:
          this.canEditBuyers = true;
          this.canEditCalendarEvents = true;
          this.canEditRealEstate = true;
          this.canEditSellers = true;
          this.canEditUsers = true;
          this.canEditUsersAccess = true;
          this.canSendEmail = true;
          this.canShowBuyers = true;
          this.canShowCalendarEvents = true;
          this.canShowRealEstate = true;
          this.canShowSellers = true;
          this.canShowUsers = true;
          this.canShowUsersAccess = true;
          break;
      }
    }

    // then give access with specific value
    this.setUserAccess(props, 'canEditBuyers');
    this.setUserAccess(props, 'canEditCalendarEvents');
    this.setUserAccess(props, 'canEditRealEstate');
    this.setUserAccess(props, 'canEditSellers');
    this.setUserAccess(props, 'canEditUsers');
    this.setUserAccess(props, 'canEditUsersAccess');
    this.setUserAccess(props, 'canSendEmail');
    this.setUserAccess(props, 'canShowBuyers');
    this.setUserAccess(props, 'canShowCalendarEvents');
    this.setUserAccess(props, 'canShowRealEstate');
    this.setUserAccess(props, 'canShowSellers');
    this.setUserAccess(props, 'canShowUsers');
    this.setUserAccess(props, 'canShowUsersAccess');
  }

  private setUserAccess(obj: { [key: string]: any }, fieldName: string): void {
    if (obj[fieldName] === true || obj[fieldName] === false) {
      this[fieldName] = obj[fieldName];
    }
  }
}
