import { Injectable, Logger } from '@nestjs/common';
import Knex from 'knex';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { execSync } from 'child_process';

@Injectable()
export class KnexService {
  private knex: Knex.Knex;
  private knexConfig: Knex.Knex.Config;
  private readonly logger = new Logger(KnexService.name);

  constructor(private readonly configService: ConfigService) {
    this.printNpmPath();
    this.initializeKnex();
  }

  private initializeKnex(): void {
    const migrationsDirectory = path.resolve(
      path.join(__dirname, './migrations'),
    );
    const seedsDirectory = path.resolve(path.join(__dirname, './seeds'));
    const baseConfig: Knex.Knex.Config = {
      migrations: {
        tableName: 'knex_migrations',
        directory: migrationsDirectory,
      },
      seeds: {
        directory: seedsDirectory,
      },
    };
    this.knexConfig = {
      ...baseConfig,
      client: 'mysql2',
      connection: this.configService.get<string>('DATABASE_URL'),
    };
    this.knex = Knex(this.knexConfig);
  }

  private printNpmPath() {
    try {
      const npmPath = execSync('which npm').toString().trim(); // Use 'where npm' on Windows
      this.logger.log(`NPM Path: ${npmPath}`);
    } catch (error) {
      this.logger.error('Error fetching npm path:', error.message);
    }
  }

  async runMigrations(): Promise<boolean> {
    try {
      const connection = this.knexConfig.connection;
      if (typeof connection === 'string') {
        this.logger.log(
          `Running knexfile.js with process.env.DATABASE_URL = ${this.obfuscateDatabaseString(connection)}`,
        );
      }
      this.logger.log('Running migrations...');
      await this.knex.migrate.latest({ loadExtensions: ['.js'] }); // Run latest migrations
      this.logger.log('Migrations completed');
      return true;
    } catch (error) {
      this.logger.error('Error running migrations:', error);
      return false;
    }
  }

  private obfuscateDatabaseString(connectionString) {
    return connectionString.replace(/:\/\/(.*?):(.*?)@/, (match, user) => {
      return `://${user}:*****@`;
    });
  }

  async seedDatabase(): Promise<boolean> {
    try {
      this.logger.log('Running seeds...');
      await this.knex.seed.run(); // Run seeds
      this.logger.log('Seeds completed');
      return true;
    } catch (error) {
      this.logger.error('Error running seeds:', error);
      return false;
    }
  }
}
