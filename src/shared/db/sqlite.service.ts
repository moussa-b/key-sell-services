import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Database } from 'sqlite3';
import * as path from 'path';
import { DatabaseService } from './database-service';

@Injectable()
export class SqliteService
  extends DatabaseService
  implements OnModuleInit, OnModuleDestroy
{
  private db: Database;
  private readonly logger = new Logger(SqliteService.name);

  constructor(private readonly configService: ConfigService) {
    super();
  }

  onModuleInit() {
    const databasePath =
      this.configService.get<string>('DATABASE_FILE') || './agency_db.sqlite';
    this.db = new Database(databasePath, (err) => {
      if (err) {
        this.logger.error('Error connecting to SQLite database:', err);
      } else {
        this.logger.log(
          `Connected to SQLite database with path: ${path.resolve(databasePath)}`,
        );
      }
    });
  }

  onModuleDestroy() {
    this.close();
  }

  async run(query: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async get<T>(
    query: string,
    params: any[] = [],
    rowMapper: (row: any) => T = (row) => row,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err: Error, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? rowMapper(row) : row);
        }
      });
    });
  }

  async all<T>(
    query: string,
    params: any[] = [],
    rowMapper: (row: any) => T = (row) => row,
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err: Error, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows ? rows.map((row) => rowMapper(row)) : rows);
        }
      });
    });
  }

  async transaction(
    queries: { query: string; params: any[] }[],
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');

        for (const { query, params } of queries) {
          this.db.run(query, params, (err) => {
            if (err) {
              this.db.run('ROLLBACK');
              reject(err);
              return;
            }
          });
        }

        this.db.run('COMMIT', (err) => {
          if (err) {
            this.db.run('ROLLBACK');
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
