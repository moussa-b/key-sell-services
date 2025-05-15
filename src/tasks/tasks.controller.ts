import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConnectedUser } from '../shared/models/current-user';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Task } from './entities/task.entity';
import { ResponseStatus } from '../shared/dto/response-status.dto';
import { LabelValue } from '../shared/dto/label-value.dto';
import { UsersService } from '../users/users.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @Permissions('canEditTasks')
  create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<Task> {
    createTaskDto.createdBy = user.id;
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @Permissions('canShowTasks')
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<Task[]> {
    return this.tasksService.findAll(startDate, endDate);
  }

  @Get('real-estates/:realEstateId')
  @Permissions('canShowTasks')
  findAllByRealEstateId(
    @Param('realEstateId') realEstateId: string,
  ): Promise<Task[]> {
    return this.tasksService.findAllByRealEstateId(+realEstateId);
  }

  @Get('users')
  @Permissions('canEditTasks')
  findAllUsers(): Promise<LabelValue<number>[]> {
    return this.usersService.findAllUsers();
  }

  @Get(':taskId')
  @Permissions('canShowTasks')
  async findOne(@Param('taskId') taskId: string): Promise<Task> {
    const task = await this.tasksService.findOne(+taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    return task;
  }

  @Patch(':taskId')
  @Permissions('canEditTasks')
  async update(
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<Task> {
    updateTaskDto.updatedBy = user.id;
    const task = await this.tasksService.findOne(+taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    return this.tasksService.update(+taskId, updateTaskDto);
  }

  @Delete(':taskId')
  async remove(@Param('taskId') taskId: string): Promise<ResponseStatus> {
    const task = await this.tasksService.findOne(+taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    return {
      status: await this.tasksService.remove(+taskId),
    };
  }
}
