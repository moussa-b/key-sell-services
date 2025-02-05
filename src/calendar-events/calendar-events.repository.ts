import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../shared/db/database-service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { CalendarEvent } from './entities/calendar-event.entity';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { v4 as uuidv4 } from 'uuid';
import { DateUtils } from '../utils/date-utils';

@Injectable()
export class CalendarEventsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  rowMapper(row: any): CalendarEvent {
    const calendarEvent = new CalendarEvent();
    calendarEvent.id = row['id'];
    calendarEvent.uuid = row['uuid'];
    calendarEvent.title = row['title'];
    calendarEvent.description = row['description'];
    calendarEvent.startDate =
      row['start_date'] instanceof Date
        ? row['start_date']
        : DateUtils.createDateFromDatabaseDate(row['start_date']); // check instanceof Date because with MySQL row value is a Date and not a string
    calendarEvent.endDate =
      row['end_date'] instanceof Date
        ? row['end_date']
        : DateUtils.createDateFromDatabaseDate(row['end_date']);
    calendarEvent.status = row['status'];
    calendarEvent.reminder = row['reminder'];
    calendarEvent.reminderSentAt = row['reminder_sent_at'];
    calendarEvent.recurring = row['recurring'] === 1;
    calendarEvent.createdBy = row['created_by'];
    calendarEvent.createdAt =
      row['created_at'] instanceof Date
        ? row['created_at']
        : DateUtils.createDateFromDatabaseDate(row['created_at']);
    calendarEvent.updatedBy = row['updated_by'];
    calendarEvent.updatedAt =
      row['updated_at'] instanceof Date
        ? row['updated_at']
        : DateUtils.createDateFromDatabaseDate(row['updated_at']);
    return calendarEvent;
  }

  async create(
    createCalendarEventDto: CreateCalendarEventDto,
  ): Promise<CalendarEvent> {
    const insertQuery = `INSERT INTO calendar_events (uuid, title, description, user_id, start_date, end_date, status, reminder, recurring, recurring_event_id, created_by)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    return this.databaseService
      .run(insertQuery, [
        uuidv4(),
        createCalendarEventDto.title,
        createCalendarEventDto.description,
        createCalendarEventDto.createdBy,
        DateUtils.createDateToDatabaseFormat(
          createCalendarEventDto.startDate,
          createCalendarEventDto.startHour,
        ),
        DateUtils.createDateToDatabaseFormat(
          createCalendarEventDto.endDate,
          createCalendarEventDto.endHour,
        ),
        createCalendarEventDto.status,
        createCalendarEventDto.reminder || null,
        createCalendarEventDto.recurring ? 1 : 0,
        null,
        createCalendarEventDto.createdBy,
      ])
      .then(() => {
        const selectQuery = `SELECT * FROM calendar_events ORDER BY id DESC LIMIT 1`;
        return this.databaseService.get<CalendarEvent>(
          selectQuery,
          undefined,
          this.rowMapper,
        );
      });
  }

  async findAll(): Promise<CalendarEvent[]> {
    return this.databaseService.all<CalendarEvent>(
      'SELECT * FROM calendar_events ORDER BY created_at DESC',
      undefined,
      this.rowMapper,
    );
  }

  async findOne(id: number): Promise<CalendarEvent> {
    return this.databaseService.get<CalendarEvent>(
      'SELECT * FROM calendar_events WHERE id = ?',
      [id],
      this.rowMapper,
    );
  }

  async update(
    id: number,
    updateCalendarEventDto: UpdateCalendarEventDto,
  ): Promise<CalendarEvent> {
    const updateQuery = `
      UPDATE calendar_events
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          start_date = COALESCE(?, start_date),
          end_date = COALESCE(?, end_date),
          status = COALESCE(?, status),
          reminder = COALESCE(?, reminder),
          updated_by = ?
      WHERE id = ?`;
    return this.databaseService
      .run(updateQuery, [
        updateCalendarEventDto.title || null,
        updateCalendarEventDto.description || null,
        updateCalendarEventDto.startDate && updateCalendarEventDto.startHour
          ? DateUtils.createDateToDatabaseFormat(
              updateCalendarEventDto.startDate,
              updateCalendarEventDto.startHour,
            )
          : null,
        updateCalendarEventDto.endDate && updateCalendarEventDto.endHour
          ? DateUtils.createDateToDatabaseFormat(
              updateCalendarEventDto.endDate,
              updateCalendarEventDto.endHour,
            )
          : null,
        updateCalendarEventDto.status || null,
        updateCalendarEventDto.reminder || null,
        updateCalendarEventDto.updatedBy,
        id,
      ])
      .then(() => {
        const selectQuery = `SELECT * FROM calendar_events WHERE id =?`;
        return this.databaseService.get<CalendarEvent>(
          selectQuery,
          [id],
          this.rowMapper,
        );
      });
  }

  async remove(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return this.databaseService
        .run('DELETE FROM calendar_events WHERE id = ?', [id])
        .then(() => {
          this.databaseService
            .get<{ count: number }>(
              'SELECT COUNT(*) as count FROM calendar_events WHERE id = ?',
              [id],
            )
            .then((result: { count: number }) => resolve(result.count === 0))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }
}
