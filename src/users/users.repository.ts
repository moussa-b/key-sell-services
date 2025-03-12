import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from './entities/user-role.enum';
import { UpdateUserSecurityDto } from './dto/update-user-security.dto';
import { DatabaseService } from '../shared/db/database-service';
import { DateUtils } from '../utils/date-utils';
import { UserAccess } from './entities/user-access.entity';
import { UserAccessConfiguration } from './entities/user-access.configuration';

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  rowMapper(row: any): User {
    const user = new User();
    user.id = row['id'];
    user.uuid = row['uuid'];
    user.email = row['email'];
    user.firstName = row['first_name'];
    user.lastName = row['last_name'];
    user.sex = row['sex'];
    user.preferredLanguage = row['preferred_language'];
    user.role = row['role'] || UserRole.USER;
    user.isActive = row['is_active'] === 1;
    user.activationToken = row['activation_token'];
    user.resetPasswordToken = row['reset_password_token'];
    user.resetPasswordExpires = row['reset_password_expires'];
    user.createdAt =
      row['created_at'] instanceof Date
        ? row['created_at']
        : DateUtils.createDateFromDatabaseDate(row['created_at']);
    user.updatedAt =
      row['updated_at'] instanceof Date
        ? row['updated_at']
        : DateUtils.createDateFromDatabaseDate(row['updated_at']);
    return user;
  }

  async create(
    userData: CreateUserDto & {
      password: string;
      activationToken: string;
      isActive: boolean;
    },
  ): Promise<User> {
    const insertQuery = `INSERT INTO users (
      uuid, username, email, password, first_name, last_name, sex, preferred_language, activation_token, role, is_active, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    return this.databaseService
      .run(insertQuery, [
        uuidv4(),
        userData.username || userData.email,
        userData.email,
        userData.password,
        userData.firstName,
        userData.lastName,
        userData.sex,
        userData.preferredLanguage,
        userData.activationToken,
        userData.role || UserRole.USER,
        userData.isActive,
        userData.createdBy,
      ])
      .then((userId: number) => {
        return this.findOne(userId);
      });
  }

  async findAll(): Promise<User[]> {
    return this.databaseService.all<User>(
      'SELECT * FROM users ORDER BY created_at ASC',
      undefined,
      this.rowMapper,
    );
  }

  async findOne(
    id: number,
    includePassword = false,
    includeUsername = false,
  ): Promise<User> {
    return this.databaseService.get<User>(
      'SELECT * FROM users WHERE id = ?',
      [id],
      (row) => {
        const user = this.rowMapper(row);
        if (includeUsername) {
          user.username = row['username'];
        }
        if (includePassword) {
          user.password = row['password'];
        }
        return user;
      },
    );
  }

  async update(
    id: number,
    customerData: Partial<CreateUserDto>,
  ): Promise<User> {
    const updateQuery = `
      UPDATE users
      SET email = ?,
          first_name = ?,
          last_name = ?,
          sex = ?,
          preferred_language = ?,
          role = ?,
          updated_by = ?
      WHERE id = ?`;
    return this.databaseService
      .run(updateQuery, [
        customerData.email || null,
        customerData.firstName || null,
        customerData.lastName || null,
        customerData.sex || null,
        customerData.preferredLanguage || null,
        customerData.role || null,
        customerData.updatedBy,
        id,
      ])
      .then(() => {
        return this.findOne(id);
      });
  }

  async remove(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return this.databaseService
        .run('DELETE FROM users WHERE id = ?', [id])
        .then(() => {
          this.databaseService
            .get<{ count: number }>(
              'SELECT COUNT(*) as count FROM users WHERE id = ?',
              [id],
            )
            .then((result: { count: number }) => resolve(result.count === 0))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  async findByEmailOrUsername(
    email: string,
    includeUserAccess = false,
  ): Promise<User> {
    let query;
    if (includeUserAccess) {
      query =
        "SELECT u.*, JSON_EXTRACT((SELECT c.property_value FROM configuration c WHERE c.category = 'standard' AND c.property_name = 'global_user_access'), '$') AS globalUserAccess, JSON_OBJECTAGG(COALESCE(ua.access, 'null_access'), JSON_MERGE_PATCH('{}', IF(ua.active = 1, 'true', 'false'))) AS userAccess FROM users u LEFT JOIN users_access ua ON ua.user_id = u.id WHERE email = ? OR username = ? GROUP BY u.id";
    } else {
      query = 'SELECT * FROM users WHERE email = ? OR username = ?';
    }
    return this.databaseService.get<User>(query, [email, email], (row: any) => {
      const user = this.rowMapper(row);
      user.password = row['password'];
      if (row['userAccess']) {
        user.userAccess = new UserAccess({
          role: user.role,
          ...row['userAccess'],
        });
        if (row['globalUserAccess']) {
          for (const key in row['globalUserAccess']) {
            if (row['globalUserAccess'][key] == false) {
              user.userAccess[key] = false;
            }
          }
        }
      }
      return user;
    });
  }

  async findById(id: number): Promise<User> {
    return this.databaseService.get<User>(
      'SELECT * FROM users WHERE id = ?',
      [id],
      this.rowMapper,
    );
  }

  async findByActivationToken(activationToken: string): Promise<User> {
    return this.databaseService.get<User>(
      'SELECT * FROM users WHERE activation_token = ?',
      [activationToken],
      this.rowMapper,
    );
  }

  async findByResetPasswordToken(resetPasswordToken: string): Promise<User> {
    return this.databaseService.get<User>(
      'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > ?',
      [resetPasswordToken, new Date()],
      this.rowMapper,
    );
  }

  async activateUser(id: number, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return this.databaseService
        .run(
          'UPDATE users SET is_active = true, activation_token = NULL, password = ? WHERE id = ?',
          [password, id],
        )
        .then(() => {
          this.databaseService
            .get<{ count: number }>(
              'SELECT COUNT(*) as count FROM users WHERE id = ? AND is_active = true',
              [id],
            )
            .then((result: { count: number }) => resolve(result.count === 1))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  async setResetPasswordToken(
    id: number,
    token: string,
    expires: Date,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return this.databaseService
        .run(
          'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
          [token, expires, id],
        )
        .then(() => {
          this.databaseService
            .get<{ count: number }>(
              'SELECT COUNT(*) as count FROM users WHERE id = ? AND reset_password_token IS NOT NULL AND reset_password_expires IS NOT NULL',
              [id],
            )
            .then((result: { count: number }) => resolve(result.count === 1))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  async resetPassword(id: number, hashedPassword: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return this.databaseService
        .run(
          'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
          [hashedPassword, id],
        )
        .then(() => {
          this.databaseService
            .get<{ count: number }>(
              'SELECT COUNT(*) as count FROM users WHERE id = ? AND reset_password_token IS NULL AND reset_password_expires IS NULL',
              [id],
            )
            .then((result: { count: number }) => resolve(result.count === 1))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  async updateProfileSecurity(
    userId: number,
    updateUserSecurityDto: UpdateUserSecurityDto,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return this.databaseService
        .run(
          `UPDATE users SET username = COALESCE(?, username),
          password = COALESCE(?, password)
          WHERE id = ?`,
          [
            updateUserSecurityDto.username?.length > 0
              ? updateUserSecurityDto.username
              : null,
            updateUserSecurityDto.newPassword?.length > 0
              ? updateUserSecurityDto.newPassword
              : null,
            userId,
          ],
        )
        .then(() => {
          this.databaseService
            .get<{ count: number }>(
              'SELECT COUNT(*) as count FROM users WHERE id = ? AND username = ?',
              [userId, updateUserSecurityDto.username],
            )
            .then((result: { count: number }) => resolve(result.count === 1))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  async getUserAccessConfiguration(
    userId: number,
    includeGlobalUserAccess: boolean,
  ): Promise<UserAccessConfiguration> {
    let query: string;
    if (includeGlobalUserAccess) {
      query =
        'SELECT JSON_EXTRACT((SELECT c.property_value FROM configuration c WHERE c.category = "standard" AND c.property_name = "global_user_access"), "$") AS globalUserAccess, IF(COUNT(ua.user_id) > 0, JSON_OBJECTAGG(COALESCE(ua.access, "null_access"), JSON_MERGE_PATCH("{}", IF(ua.active = 1, "true", "false"))), NULL) AS userAccess FROM users u LEFT JOIN users_access ua ON ua.user_id = u.id WHERE u.id = ? GROUP BY u.id';
    } else {
      query =
        'SELECT JSON_OBJECT() AS globalUserAccess, IF(COUNT(ua.user_id) > 0, JSON_OBJECTAGG(COALESCE(ua.access, "null_access"), JSON_MERGE_PATCH("{}", IF(ua.active = 1, "true", "false"))), NULL) AS userAccess FROM users u LEFT JOIN users_access ua ON ua.user_id = u.id WHERE u.id = ? GROUP BY u.id';
    }
    return this.databaseService.get<UserAccessConfiguration>(
      query,
      [userId],
      (row: any) => {
        const userAccessConfigurationDto = new UserAccessConfiguration();
        if (row['userAccess']) {
          userAccessConfigurationDto.userAccess = new UserAccess(
            row['userAccess'],
          );
        }
        userAccessConfigurationDto.globalUserAccess = new UserAccess(
          row['globalUserAccess'],
        );
        return userAccessConfigurationDto;
      },
    );
  }

  async updateUserAccess(userId: number, userAccess: UserAccess) {
    const insertUserAccess = `REPLACE
    INTO users_access (user_id, access, active)`;
    await this.databaseService.batchInsert(
      insertUserAccess,
      Object.keys(userAccess).map((key: string) => [
        userId,
        key,
        userAccess[key] === true,
      ]),
    );

    return this.databaseService.get<UserAccess>(
      'SELECT JSON_OBJECTAGG(access, IF(active = 1, true, false)) AS userAccess FROM users_access WHERE user_id = ?',
      [userId],
      (row) => new UserAccess(row['userAccess']),
    );
  }
}
