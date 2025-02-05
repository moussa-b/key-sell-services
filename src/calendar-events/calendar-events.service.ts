import { Injectable } from '@nestjs/common';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { CalendarEventsRepository } from './calendar-events.repository';
import { CalendarEvent } from './entities/calendar-event.entity';

@Injectable()
export class CalendarEventsService {
  constructor(
    private readonly calendarEventsRepository: CalendarEventsRepository,
  ) {}

  async create(
    createCalendarEventDto: CreateCalendarEventDto,
  ): Promise<CalendarEvent> {
    return this.calendarEventsRepository.create(createCalendarEventDto);
  }

  async findAll(): Promise<CalendarEvent[]> {
    return this.calendarEventsRepository.findAll();
  }

  async findOne(id: number): Promise<CalendarEvent> {
    return this.calendarEventsRepository.findOne(id);
  }

  async update(
    id: number,
    updateCalendarEventDto: UpdateCalendarEventDto,
  ): Promise<CalendarEvent> {
    return this.calendarEventsRepository.update(id, updateCalendarEventDto);
  }

  async remove(id: number): Promise<boolean> {
    return this.calendarEventsRepository.remove(id);
  }
}
