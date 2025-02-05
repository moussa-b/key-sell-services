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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CalendarEvent } from './entities/calendar-event.entity';
import { ResponseStatus } from '../shared/dto/response-status.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConnectedUser } from '../shared/models/current-user';

@ApiTags('Calendar Events')
@UseGuards(JwtAuthGuard)
@Controller('calendar-events')
export class CalendarEventsController {
  constructor(private readonly calendarEventsService: CalendarEventsService) {}

  @ApiOperation({ summary: 'Create a new calendar event' })
  @ApiResponse({
    status: 201,
    description: 'The event has been successfully created.',
    type: CalendarEvent,
  })
  @Post()
  create(
    @Body() createCalendarEventDto: CreateCalendarEventDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<CalendarEvent> {
    createCalendarEventDto.createdBy = user.id;
    return this.calendarEventsService.create(createCalendarEventDto);
  }

  @ApiOperation({ summary: 'Retrieve a list of all calendar events' })
  @ApiResponse({
    status: 200,
    description: 'List of all calendar events.',
    type: [CalendarEvent],
  })
  @Get()
  findAll(): Promise<CalendarEvent[]> {
    return this.calendarEventsService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve a calendar event by ID' })
  @ApiResponse({
    status: 200,
    description: 'The calendar event with the given ID.',
    type: CalendarEvent,
  })
  @ApiResponse({ status: 404, description: 'Calendar event not found.' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CalendarEvent> {
    const calendarEvent = await this.calendarEventsService.findOne(+id);
    if (!calendarEvent) {
      throw new NotFoundException(`Calendar event with ID ${id} not found`);
    }
    return calendarEvent;
  }

  @ApiOperation({ summary: 'Update a calendar event' })
  @ApiResponse({
    status: 200,
    description: 'The calendar event has been successfully updated.',
    type: CalendarEvent,
  })
  @ApiResponse({ status: 404, description: 'Calendar event not found.' })
  @Patch(':id')
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

  @ApiOperation({ summary: 'Delete a calendar event by ID' })
  @ApiResponse({
    status: 200,
    description: 'The calendar event has been successfully deleted.',
    type: ResponseStatus,
  })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ResponseStatus> {
    const calendarEvent = await this.calendarEventsService.findOne(+id);
    if (!calendarEvent) {
      throw new NotFoundException(`Calendar event with ID ${id} not found`);
    }
    return { status: await this.calendarEventsService.remove(+id) };
  }
}
