import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from './entities/user-role.enum';
import { UpdateUserSecurityDto } from './dto/update-user-security.dto';
import { DatabaseService } from '../shared/db/database-service';
import { DateUtils } from '../utils/date-utils';

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  rowMapper(row: any, includePassword = false, includeUsername = false): User {
    const user = new User();
    user.id = row['id'];
    user.uuid = row['uuid'];
    if (includeUsername) {
      user.username = row['username'];
    }
    user.email = row['email'];
    if (includePassword) {
      user.password = row['password'];
    }
    user.firstName = row['first_name'];
    user.lastName = row['last_name'];
    user.sex = row['sex'];
    user.preferredLanguage = row['preferred_language'];
    user.role = row['role'];
    user.isActive = row['is_active'];
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
      .then(() => {
        const selectQuery = `SELECT * FROM users ORDER BY id DESC LIMIT 1`;
        return this.databaseService.get<User>(
          selectQuery,
          undefined,
          this.rowMapper,
        );
      });
  }

  async findAll(): Promise<User[]> {
    return this.databaseService.all<User>(
      'SELECT * FROM users ORDER BY created_at DESC',
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
      (row) => this.rowMapper(row, includePassword, includeUsername),
    );
  }

  async update(
    id: number,
    customerData: Partial<CreateUserDto>,
  ): Promise<User> {
    const updateQuery = `
      UPDATE users
      SET email = COALESCE(?, email),
          first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          sex = COALESCE(?, sex),
          preferred_language = COALESCE(?, preferred_language),
          role = COALESCE(?, role),
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

  async findByEmailOrUsername(email: string): Promise<User> {
    return this.databaseService.get<User>(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, email],
      (row: any) => this.rowMapper(row, true),
    );
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
}
