import { TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
  id?: number;
  uuid: string;
  type: string;
  status: TaskStatus;
  title: string;
  description: string;
  date: Date;
  duration: number;
  users?: number[];
  tasks?: number[];
  realEstateId?: number;
  createdBy?: number;
  updatedBy?: number;
}
