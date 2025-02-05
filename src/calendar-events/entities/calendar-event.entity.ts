import { CalendarEventStatus } from './calendar-event-status.enum';

export class CalendarEvent {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  userId?: number;
  startDate: Date;
  endDate: Date;
  status?: CalendarEventStatus;
  reminder?: number;
  reminderSentAt?: Date;
  recurring?: boolean;
  recurringEventId?: number;
  createdBy?: number;
  createdAt: Date;
  updatedBy?: number;
  updatedAt?: Date;
}
