import { Injectable } from '@nestjs/common';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../shared/db/database-service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { DateUtils } from '../utils/date-utils';
import { LabelValue } from '../shared/dto/label-value.dto';

@Injectable()
export class TasksRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly selectQuery = `
    SELECT
      t.id,
      t.uuid,
      t.type,
      t.status,
      t.title,
      t.description,
      t.date,
      t.duration,
      t.created_by,
      t.created_at,
      t.updated_by,
      t.updated_at,
      JSON_ARRAYAGG(tu.user_id) AS users,
      JSON_ARRAYAGG(JSON_OBJECT('label', CONCAT(u.last_name, ' ', u.first_name), 'value', u.id)) AS users_details,
      tre.real_estate_id AS real_estate_id
    FROM
      keysell.tasks t
        LEFT JOIN
      keysell.tasks_users tu ON t.id = tu.task_id
        LEFT JOIN
      keysell.users u ON tu.user_id = u.id
        LEFT JOIN
      keysell.tasks_real_estates tre ON t.id = tre.task_id`;

  private readonly groupBySelectQuery = `
    GROUP BY
      t.id, t.uuid, t.type, t.title, t.description, t.date, t.duration, t.created_by, t.created_at, t.updated_by, t.updated_at, tre.real_estate_id`;

  private buildSelectQuery(
    whereClause?: string,
    orderByClause?: string,
  ): string {
    return `${this.selectQuery} ${whereClause ? whereClause : ''} ${this.groupBySelectQuery} ${orderByClause ? orderByClause : ''}`;
  }

  rowMapper(row: any): Task {
    const task = new Task();
    task.id = row['id'];
    task.uuid = row['uuid'];
    task.type = row['type'];
    task.title = row['title'];
    task.status = row['status'];
    task.description = row['description'];
    task.date =
      row['date'] instanceof Date
        ? row['date']
        : DateUtils.createDateFromDatabaseDate(row['date']);
    task.duration = row['duration'];
    task.users = row['users'];
    task.usersDetails = row['users_details'];
    task.createdBy = row['created_by'];
    task.createdAt =
      row['created_at'] instanceof Date
        ? row['created_at']
        : DateUtils.createDateFromDatabaseDate(row['created_at']);
    task.updatedBy = row['updated_by'];
    task.updatedAt =
      row['updated_at'] instanceof Date
        ? row['updated_at']
        : DateUtils.createDateFromDatabaseDate(row['updated_at']);
    return task;
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const insertTaskQuery = `INSERT INTO keysell.tasks (uuid, type, status, title, description, date, duration, created_by)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    return this.databaseService
      .run(insertTaskQuery, [
        uuidv4(),
        createTaskDto.type,
        createTaskDto.status,
        createTaskDto.title,
        createTaskDto.description,
        createTaskDto.date,
        createTaskDto.duration,
        createTaskDto.createdBy,
      ])
      .then(async (taskId: number) => {
        if (createTaskDto.realEstateId > 0) {
          await this.databaseService.run(
            `INSERT INTO keysell.tasks_real_estates (task_id, real_estate_id) VALUES (?, ?)`,
            [taskId, createTaskDto.realEstateId],
          );
        }
        if (createTaskDto.users?.length > 0) {
          await this.databaseService.batchInsert(
            `INSERT INTO keysell.tasks_users (task_id, user_id)`,
            createTaskDto.users.map((userId: number) => [taskId, userId]),
          );
        }
        return this.findOne(taskId);
      });
  }

  async findAll(): Promise<Task[]> {
    return this.databaseService.all<Task>(
      this.buildSelectQuery(),
      undefined,
      this.rowMapper,
    );
  }

  async findAllByRealEstateId(realEstateId: number) {
    return this.databaseService.all<Task>(
      this.buildSelectQuery(
        'WHERE tre.real_estate_id = ?',
        'ORDER BY created_at ASC',
      ),
      [realEstateId],
      this.rowMapper,
    );
  }

  async findOne(taskId: number): Promise<Task> {
    return this.databaseService.get<Task>(
      this.buildSelectQuery('WHERE t.id = ?'),
      [taskId],
      this.rowMapper,
    );
  }

  async update(taskId: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const updateQuery = `
      UPDATE keysell.tasks
      SET type        = ?,
          status      = ?,
          title       = ?,
          description = ?,
          date        = ?,
          duration    = ?,
          updated_by  = ?
      WHERE id = ?`;
    return this.databaseService
      .run(updateQuery, [
        updateTaskDto.type || null,
        updateTaskDto.status || null,
        updateTaskDto.title || null,
        updateTaskDto.description || null,
        updateTaskDto.date || null,
        updateTaskDto.duration || null,
        updateTaskDto.updatedBy,
        taskId,
      ])
      .then(async () => {
        await this.databaseService.run(
          'DELETE FROM keysell.tasks_real_estates WHERE task_id = ?',
          [taskId],
        );
        await this.databaseService.run(
          'DELETE FROM keysell.tasks_users WHERE task_id = ?',
          [taskId],
        );
        if (updateTaskDto.realEstateId > 0) {
          await this.databaseService.run(
            `INSERT INTO keysell.tasks_real_estates (task_id, real_estate_id) VALUES (?, ?)`,
            [taskId, updateTaskDto.realEstateId],
          );
        }
        if (updateTaskDto.users?.length > 0) {
          await this.databaseService.batchInsert(
            `INSERT INTO keysell.tasks_users (task_id, user_id)`,
            updateTaskDto.users.map((userId: number) => [taskId, userId]),
          );
        }
        return this.findOne(taskId);
      });
  }

  async updateTaskStatus(
    taskId: number,
    updateTaskStatusDto: { status: TaskStatus; updatedBy: number },
  ) {
    const updateQuery = `UPDATE keysell.tasks SET status = ?, updated_by = ? WHERE id = ?`;
    await this.databaseService.run(updateQuery, [
      updateTaskStatusDto.status || null,
      updateTaskStatusDto.updatedBy,
      taskId,
    ]);
    const result = await this.databaseService.get(
      `SELECT status FROM keysell.tasks WHERE id = ?`,
      [taskId],
    );
    return result?.status === updateTaskStatusDto.status;
  }

  async remove(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return this.databaseService
        .run('DELETE FROM keysell.tasks WHERE id = ?', [id])
        .then(() => {
          this.databaseService
            .get<{ count: number }>(
              'SELECT COUNT(*) as count FROM keysell.tasks WHERE id = ?',
              [id],
            )
            .then((result: { count: number }) => resolve(result.count === 0))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  findAllTaskType(lang: string): LabelValue<number>[] {
    const labelColumn = lang === 'fr' ? 'label_fr' : 'label_en';
    return this.databaseService.all<LabelValue<number>>(
      `SELECT id as value, ${labelColumn} as label FROM keysell.tasks_types ORDER BY display_order`,
      undefined,
      this.databaseService.labelValueRowMapper,
    );
  }
}
