import { LabelValue } from '../../shared/dto/label-value.dto';

export class Task {
  id?: number;
  uuid: string;
  type: number;
  status: TaskStatus;
  title: string;
  description: string;
  date: Date;
  duration: number;
  users?: number[];
  usersDetails?: LabelValue<string>[];
  createdBy?: number;
  createdAt: Date;
  updatedBy?: number;
  updatedAt?: Date;
}

export enum TaskStatus {
  NONE = 'NONE',
  TO_DO = 'TO_DO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}
