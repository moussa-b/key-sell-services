import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksRepository } from './tasks.repository';
import { Task, TaskStatus } from './entities/task.entity';
import { LabelValue } from '../shared/dto/label-value.dto';

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksRepository.create(createTaskDto);
  }

  async findAll(): Promise<Task[]> {
    return this.tasksRepository.findAll();
  }

  async findAllByRealEstateId(realEstateId: number): Promise<Task[]> {
    return this.tasksRepository.findAllByRealEstateId(realEstateId);
  }

  async findOne(taskId: number): Promise<Task> {
    return this.tasksRepository.findOne(taskId);
  }

  async update(taskId: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    return this.tasksRepository.update(taskId, updateTaskDto);
  }

  async updateTaskStatus(
    taskId: number,
    updateTaskStatusDto: { status: TaskStatus; updatedBy: number },
  ): Promise<boolean> {
    return this.tasksRepository.updateTaskStatus(taskId, updateTaskStatusDto);
  }

  async remove(taskId: number): Promise<boolean> {
    return this.tasksRepository.remove(taskId);
  }

  async findAllTaskType(lang = 'en'): Promise<LabelValue<number>[]> {
    return this.tasksRepository.findAllTaskType(lang);
  }
}
