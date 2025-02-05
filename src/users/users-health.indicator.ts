import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { DatabaseService } from '../shared/db/database-service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersHealthIndicator {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    let userTableCount = { count: 0 };
    if (this.configService.get<string>('DATABASE_URL')?.length > 0) {
      if (this.configService.get<string>('DATABASE_URL').includes('mysql')) {
        userTableCount = await this.databaseService.get(
          'SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = (SELECT DATABASE() AS databaseName) AND table_name = "users";',
        );
      }
    } else {
      //sqlite
      userTableCount = await this.databaseService.get(
        'SELECT COUNT(*) as count FROM sqlite_master WHERE type="table" AND name="users"',
      );
    }
    const adminUserCount = await this.databaseService.get(
      'SELECT COUNT(*) as count FROM users WHERE username = "admin"',
    );
    const isHealthy =
      userTableCount?.count === 1 && adminUserCount?.count === 1;

    const indicator = this.healthIndicatorService.check('users');
    if (!isHealthy) {
      return indicator.down({
        isUsersTablePresent: userTableCount?.count === 1,
        isAdminUserPresent: adminUserCount?.count === 1,
      });
    }
    return indicator.up({
      isUsersTablePresent: true,
      isAdminUserPresent: true,
    });
  }
}
