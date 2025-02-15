import { Injectable } from '@nestjs/common';
import { Seller } from './entities/seller.entity';
import { CreateSellerDto } from './dto/create-seller.dto';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../shared/db/database-service';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { DateUtils } from '../utils/date-utils';

@Injectable()
export class SellersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  rowMapper(row: any): Seller {
    const seller = new Seller();
    seller.id = row['id'];
    seller.uuid = row['uuid'];
    seller.firstName = row['first_name'];
    seller.lastName = row['last_name'];
    seller.email = row['email'];
    seller.phone = row['phone'];
    seller.sex = row['sex'];
    seller.preferredLanguage = row['preferred_language'];
    seller.address = row['address'];
    seller.createdAt =
      row['created_at'] instanceof Date
        ? row['created_at']
        : DateUtils.createDateFromDatabaseDate(row['created_at']);
    seller.updatedAt =
      row['updated_at'] instanceof Date
        ? row['updated_at']
        : DateUtils.createDateFromDatabaseDate(row['updated_at']);
    return seller;
  }

  async create(createSellerDto: CreateSellerDto): Promise<Seller> {
    const insertQuery = `INSERT INTO sellers (uuid, first_name, last_name, email, phone, sex, preferred_language, address, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    return this.databaseService
      .run(insertQuery, [
        uuidv4(),
        createSellerDto.firstName,
        createSellerDto.lastName,
        createSellerDto.email,
        createSellerDto.phone,
        createSellerDto.sex,
        createSellerDto.preferredLanguage,
        createSellerDto.address,
        createSellerDto.createdBy,
      ])
      .then(() => {
        const selectQuery = `SELECT * FROM sellers ORDER BY id DESC LIMIT 1`;
        return this.databaseService.get<Seller>(
          selectQuery,
          undefined,
          this.rowMapper,
        );
      });
  }

  async findAll(): Promise<Seller[]> {
    return this.databaseService.all<Seller>(
      'SELECT * FROM sellers ORDER BY created_at ASC',
      undefined,
      this.rowMapper,
    );
  }

  async findOne(id: number): Promise<Seller> {
    return this.databaseService.get<Seller>(
      'SELECT * FROM sellers WHERE id = ?',
      [id],
      this.rowMapper,
    );
  }

  async update(id: number, updateSellerDto: UpdateSellerDto): Promise<Seller> {
    const updateQuery = `
      UPDATE sellers
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
        updateSellerDto.firstName || null,
        updateSellerDto.lastName || null,
        updateSellerDto.email || null,
        updateSellerDto.phone || null,
        updateSellerDto.sex || null,
        updateSellerDto.preferredLanguage || null,
        updateSellerDto.address || null,
        updateSellerDto.updatedBy,
        id,
      ])
      .then(() => {
        const selectQuery = `SELECT * FROM sellers WHERE id =?`;
        return this.databaseService.get<Seller>(
          selectQuery,
          [id],
          this.rowMapper,
        );
      });
  }

  async remove(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return this.databaseService
        .run('DELETE FROM sellers WHERE id = ?', [id])
        .then(() => {
          this.databaseService
            .get<{ count: number }>(
              'SELECT COUNT(*) as count FROM sellers WHERE id = ?',
              [id],
            )
            .then((result: { count: number }) => resolve(result.count === 0))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }
}
