import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CalendarEventsService } from './calendar-events.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CalendarEvent } from './entities/calendar-event.entity';
import { ResponseStatus } from '../shared/dto/response-status.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConnectedUser } from '../shared/models/current-user';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('calendar-events')
export class CalendarEventsController {
  constructor(private readonly calendarEventsService: CalendarEventsService) {}

  @Post()
  @Permissions('canEditCalendarEvents')
  create(
    @Body() createCalendarEventDto: CreateCalendarEventDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<CalendarEvent> {
    createCalendarEventDto.createdBy = user.id;
    return this.calendarEventsService.create(createCalendarEventDto);
  }

  @Get()
  @Permissions('canShowCalendarEvents')
  findAll(): Promise<CalendarEvent[]> {
    return this.calendarEventsService.findAll();
  }

  @Get(':id')
  @Permissions('canShowCalendarEvents')
  async findOne(@Param('id') id: string): Promise<CalendarEvent> {
    const calendarEvent = await this.calendarEventsService.findOne(+id);
    if (!calendarEvent) {
      throw new NotFoundException(`Calendar event with ID ${id} not found`);
    }
    return calendarEvent;
  }

  @Patch(':id')
  @Permissions('canEditCalendarEvents')
  async update(
    @Param('id') id: string,
    @Body() updateCalendarEventDto: UpdateCalendarEventDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<CalendarEvent> {
    const calendarEvent = await this.calendarEventsService.findOne(+id);
    if (!calendarEvent) {
      throw new NotFoundException(`Calendar event with ID ${id} not found`);
    }
    updateCalendarEventDto.updatedBy = user.id;
    return this.calendarEventsService.update(+id, updateCalendarEventDto);
  }

  @Delete(':id')
  @Permissions('canEditCalendarEvents')
  async remove(@Param('id') id: string): Promise<ResponseStatus> {
    const calendarEvent = await this.calendarEventsService.findOne(+id);
    if (!calendarEvent) {
      throw new NotFoundException(`Calendar event with ID ${id} not found`);
    }
    return { status: await this.calendarEventsService.remove(+id) };
  }
}
