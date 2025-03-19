import { CalendarEventStatus } from '../entities/calendar-event-status.enum';
import { RepetitionOptions } from './repetition-option';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateCalendarEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}\.\d{2}\.\d{4}$/, {
    message: 'startDate must be in the format dd.mm.yyyy',
  })
  startDate: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startHour must be in the format hh:mm (24-hour format)',
  })
  startHour: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}\.\d{2}\.\d{4}$/, {
    message: 'endDate must be in the format dd.mm.yyyy',
  })
  endDate: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endHour must be in the format hh:mm (24-hour format)',
  })
  endHour: string;

  status?: CalendarEventStatus;

  reminder?: number;

  recurring?: boolean;

  recurringOptions?: RepetitionOptions;

  createdBy?: number;

  updatedBy?: number;
}
