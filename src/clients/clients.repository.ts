import { Injectable } from '@nestjs/common';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../shared/db/database-service';
import { UpdateClientDto } from './dto/update-client.dto';
import { DateUtils } from '../utils/date-utils';

@Injectable()
export class ClientsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  rowMapper(row: any): Client {
    const client = new Client();
    client.id = row['id'];
    client.uuid = row['uuid'];
    client.firstName = row['first_name'];
    client.lastName = row['last_name'];
    client.email = row['email'];
    client.phone = row['phone'];
    client.sex = row['sex'];
    client.preferredLanguage = row['preferred_language'];
    client.address = row['address'];
    client.createdAt =
      row['created_at'] instanceof Date
        ? row['created_at']
        : DateUtils.createDateFromDatabaseDate(row['created_at']);
    client.updatedAt =
      row['updated_at'] instanceof Date
        ? row['updated_at']
        : DateUtils.createDateFromDatabaseDate(row['updated_at']);
    return client;
  }

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const insertQuery = `INSERT INTO clients (uuid, first_name, last_name, email, phone, sex, preferred_language, address, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    return this.databaseService
      .run(insertQuery, [
        uuidv4(),
        createClientDto.firstName,
        createClientDto.lastName,
        createClientDto.email,
        createClientDto.phone,
        createClientDto.sex,
        createClientDto.preferredLanguage,
        createClientDto.address,
        createClientDto.createdBy,
      ])
      .then(() => {
        const selectQuery = `SELECT * FROM clients ORDER BY id DESC LIMIT 1`;
        return this.databaseService.get<Client>(
          selectQuery,
          undefined,
          this.rowMapper,
        );
      });
  }

  async findAll(): Promise<Client[]> {
    return this.databaseService.all<Client>(
      'SELECT * FROM clients ORDER BY created_at DESC',
      undefined,
      this.rowMapper,
    );
  }

  async findOne(id: number): Promise<Client> {
    return this.databaseService.get<Client>(
      'SELECT * FROM clients WHERE id = ?',
      [id],
      this.rowMapper,
    );
  }

  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    const updateQuery = `
      UPDATE clients
      SET first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          sex = COALESCE(?, sex),
          preferred_language = COALESCE(?, preferred_language),
          address = COALESCE(?, address),
          updated_by = ?
      WHERE id = ?`;
    return this.databaseService
      .run(updateQuery, [
        updateClientDto.firstName || null,
        updateClientDto.lastName || null,
        updateClientDto.email || null,
        updateClientDto.phone || null,
        updateClientDto.sex || null,
        updateClientDto.preferredLanguage || null,
        updateClientDto.address || null,
        updateClientDto.updatedBy,
        id,
      ])
      .then(() => {
        const selectQuery = `SELECT * FROM clients WHERE id =?`;
        return this.databaseService.get<Client>(
          selectQuery,
          [id],
          this.rowMapper,
        );
      });
  }

  async remove(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return this.databaseService
        .run('DELETE FROM clients WHERE id = ?', [id])
        .then(() => {
          this.databaseService
            .get<{ count: number }>(
              'SELECT COUNT(*) as count FROM clients WHERE id = ?',
              [id],
            )
            .then((result: { count: number }) => resolve(result.count === 0))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }
}
