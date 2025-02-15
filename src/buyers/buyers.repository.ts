import { Injectable } from '@nestjs/common';
import { Buyer } from './entities/buyer.entity';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../shared/db/database-service';
import { UpdateBuyerDto } from './dto/update-buyer.dto';
import { DateUtils } from '../utils/date-utils';

@Injectable()
export class BuyersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  rowMapper(row: any): Buyer {
    const buyer = new Buyer();
    buyer.id = row['id'];
    buyer.uuid = row['uuid'];
    buyer.firstName = row['first_name'];
    buyer.lastName = row['last_name'];
    buyer.email = row['email'];
    buyer.phone = row['phone'];
    buyer.sex = row['sex'];
    buyer.preferredLanguage = row['preferred_language'];
    buyer.address = row['address'];
    buyer.createdAt =
      row['created_at'] instanceof Date
        ? row['created_at']
        : DateUtils.createDateFromDatabaseDate(row['created_at']);
    buyer.updatedAt =
      row['updated_at'] instanceof Date
        ? row['updated_at']
        : DateUtils.createDateFromDatabaseDate(row['updated_at']);
    return buyer;
  }

  async create(createBuyerDto: CreateBuyerDto): Promise<Buyer> {
    const insertQuery = `INSERT INTO buyers (uuid, first_name, last_name, email, phone, sex, preferred_language, address, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    return this.databaseService
      .run(insertQuery, [
        uuidv4(),
        createBuyerDto.firstName,
        createBuyerDto.lastName,
        createBuyerDto.email,
        createBuyerDto.phone,
        createBuyerDto.sex,
        createBuyerDto.preferredLanguage,
        createBuyerDto.address,
        createBuyerDto.createdBy,
      ])
      .then(() => {
        const selectQuery = `SELECT * FROM buyers ORDER BY id DESC LIMIT 1`;
        return this.databaseService.get<Buyer>(
          selectQuery,
          undefined,
          this.rowMapper,
        );
      });
  }

  async findAll(): Promise<Buyer[]> {
    return this.databaseService.all<Buyer>(
      'SELECT * FROM buyers ORDER BY created_at ASC',
      undefined,
      this.rowMapper,
    );
  }

  async findOne(id: number): Promise<Buyer> {
    return this.databaseService.get<Buyer>(
      'SELECT * FROM buyers WHERE id = ?',
      [id],
      this.rowMapper,
    );
  }

  async update(id: number, updateBuyerDto: UpdateBuyerDto): Promise<Buyer> {
    const updateQuery = `
      UPDATE buyers
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
        updateBuyerDto.firstName || null,
        updateBuyerDto.lastName || null,
        updateBuyerDto.email || null,
        updateBuyerDto.phone || null,
        updateBuyerDto.sex || null,
        updateBuyerDto.preferredLanguage || null,
        updateBuyerDto.address || null,
        updateBuyerDto.updatedBy,
        id,
      ])
      .then(() => {
        const selectQuery = `SELECT * FROM buyers WHERE id =?`;
        return this.databaseService.get<Buyer>(
          selectQuery,
          [id],
          this.rowMapper,
        );
      });
  }

  async remove(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return this.databaseService
        .run('DELETE FROM buyers WHERE id = ?', [id])
        .then(() => {
          this.databaseService
            .get<{ count: number }>(
              'SELECT COUNT(*) as count FROM buyers WHERE id = ?',
              [id],
            )
            .then((result: { count: number }) => resolve(result.count === 0))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }
}
