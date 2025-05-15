import { UserRole } from './user-role.enum';

export class UserAccess {
  canEditBuyers = false;
  canEditCalendarEvents = false;
  canEditPlanning = false;
  canEditRealEstates = false;
  canEditSellers = false;
  canEditTasks = false;
  canEditUsers = false;
  canEditUsersAccess = false;
  canSendEmail = false;
  canShowBuyers = false;
  canShowCalendarEvents = false;
  canShowPlanning = false;
  canShowRealEstates = false;
  canShowSellers = false;
  canShowTasks = false;
  canShowUsers = false;
  canShowUsersAccess = false;

  constructor(props: { [key: string]: any }) {
    // first give accesses with role
    const userRole = props.role;
    if (userRole) {
      switch (userRole) {
        case UserRole.USER:
          this.canEditTasks = true;
          this.canShowBuyers = true;
          this.canShowCalendarEvents = true;
          this.canShowRealEstates = true;
          this.canShowSellers = true;
          this.canShowTasks = true;
          break;
        case UserRole.MANAGER:
          this.canEditBuyers = true;
          this.canEditCalendarEvents = true;
          this.canEditPlanning = true;
          this.canEditRealEstates = true;
          this.canEditSellers = true;
          this.canEditTasks = true;
          this.canSendEmail = true;
          this.canShowBuyers = true;
          this.canShowCalendarEvents = true;
          this.canShowPlanning = true;
          this.canShowRealEstates = true;
          this.canShowSellers = true;
          this.canShowTasks = true;
          this.canShowUsers = true;
          this.canShowUsersAccess = true;
          break;
        case UserRole.ADMIN:
          this.canEditBuyers = true;
          this.canEditCalendarEvents = true;
          this.canEditPlanning = true;
          this.canEditRealEstates = true;
          this.canEditSellers = true;
          this.canEditTasks = true;
          this.canEditUsers = true;
          this.canEditUsersAccess = true;
          this.canSendEmail = true;
          this.canShowBuyers = true;
          this.canShowCalendarEvents = true;
          this.canShowPlanning = true;
          this.canShowRealEstates = true;
          this.canShowSellers = true;
          this.canShowTasks = true;
          this.canShowUsers = true;
          this.canShowUsersAccess = true;
          break;
      }
    }

    // then give access with specific value
    this.setUserAccess(props, 'canEditBuyers');
    this.setUserAccess(props, 'canEditCalendarEvents');
    this.setUserAccess(props, 'canEditPlanning');
    this.setUserAccess(props, 'canEditRealEstates');
    this.setUserAccess(props, 'canEditSellers');
    this.setUserAccess(props, 'canEditTasks');
    this.setUserAccess(props, 'canEditUsers');
    this.setUserAccess(props, 'canEditUsersAccess');
    this.setUserAccess(props, 'canSendEmail');
    this.setUserAccess(props, 'canShowBuyers');
    this.setUserAccess(props, 'canShowCalendarEvents');
    this.setUserAccess(props, 'canShowPlanning');
    this.setUserAccess(props, 'canShowRealEstates');
    this.setUserAccess(props, 'canShowSellers');
    this.setUserAccess(props, 'canShowTasks');
    this.setUserAccess(props, 'canShowUsers');
    this.setUserAccess(props, 'canShowUsersAccess');
  }

  private setUserAccess(obj: { [key: string]: any }, fieldName: string): void {
    if (obj[fieldName] === true || obj[fieldName] === false) {
      this[fieldName] = obj[fieldName];
    }
  }
}
