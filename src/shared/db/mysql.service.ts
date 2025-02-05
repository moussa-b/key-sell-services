import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { createPool, Pool, PoolConnection } from 'mysql2/promise';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database-service';

@Injectable()
export class MysqlService
  extends DatabaseService
  implements OnModuleInit, OnModuleDestroy
{
  private pool?: Pool;
  private readonly logger = new Logger(MysqlService.name);

  constructor(private readonly configService: ConfigService) {
    super();
    if (this.configService.get<string>('DATABASE_URL')?.includes('mysql')) {
      this.pool = createPool({
        uri: this.configService.get<string>('DATABASE_URL'),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    }
  }

  async run(query: string, params: any[] = []): Promise<void> {
    try {
      const connection = await this.pool.getConnection();
      params?.forEach((param: any, index: number) => {
        if (param === undefined) {
          params[index] = null;
        }
      });
      await connection.execute(query, params);
      connection.release();
    } catch (err) {
      throw err;
    }
  }

  async get<T>(
    query: string,
    params: any[] = [],
    rowMapper: (row: any) => T = (row) => row,
  ): Promise<T> {
    params?.forEach((param: any, index: number) => {
      if (param === undefined) {
        params[index] = null;
      }
    });
    try {
      const [rows] = await this.pool.execute(query, params);
      const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
      return row ? rowMapper(row) : null;
    } catch (err) {
      throw err;
    }
  }

  async all<T>(
    query: string,
    params: any[] = [],
    rowMapper: (row: any) => T = (row) => row,
  ): Promise<T[]> {
    params?.forEach((param: any, index: number) => {
      if (param === undefined) {
        params[index] = null;
      }
    });
    try {
      const [rows] = await this.pool.execute(query, params);
      return Array.isArray(rows) ? rows.map((row) => rowMapper(row)) : [];
    } catch (err) {
      throw err;
    }
  }

  async transaction(
    queries: { query: string; params: any[] }[],
  ): Promise<void> {
    queries.forEach((q: { query: string; params: any[] }) => {
      q.params?.forEach((param: any, index: number) => {
        if (param === undefined) {
          q.params[index] = null;
        }
      });
    });
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const { query, params } of queries) {
        await connection.execute(query, params);
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  // Lifecycle hook to check connection on initialization
  async onModuleInit() {
    if (!this.pool) {
      return;
    }
    try {
      const connection = await this.pool.getConnection();
      this.logger.log('MySQL Database connected successfully');
      connection.release();
    } catch (error) {
      this.logger.error('Error connecting to MySQL:', error.message);
      throw error;
    }
  }

  // Lifecycle hook to clean up the pool on module destruction
  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('MySQL Database connection closed');
  }

  // Generic query method
  async query<T = any>(queryText: string, params?: any[]): Promise<T[]> {
    try {
      const [rows] = await this.pool.query<any[]>(queryText, params);
      return rows;
    } catch (error) {
      this.logger.error('Database query error:', error.message);
      throw error;
    }
  }

  // Transaction helper method
  async transactionOriginal<T>(
    callback: (connection: PoolConnection) => Promise<T>,
  ): Promise<T> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      this.logger.error('Transaction error:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  }
}
