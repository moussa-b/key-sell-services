import { Injectable } from '@nestjs/common';
import { Seller } from './entities/seller.entity';
import { CreateSellerDto } from './dto/create-seller.dto';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../shared/db/database-service';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { DateUtils } from '../utils/date-utils';
import { AddressesRepository } from '../shared/addresses.repository';
import { Address } from '../shared/models/address.entity';

@Injectable()
export class SellersRepository {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly addressesRepository: AddressesRepository,
  ) {}

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
    seller.createdBy = row['created_by'];
    seller.createdAt =
      row['created_at'] instanceof Date
        ? row['created_at']
        : DateUtils.createDateFromDatabaseDate(row['created_at']);
    seller.updatedBy = row['updated_by'];
    seller.updatedAt =
      row['updated_at'] instanceof Date
        ? row['updated_at']
        : DateUtils.createDateFromDatabaseDate(row['updated_at']);
    if (row['addressId']) {
      seller.address = new Address({
        id: row['addressId'],
        street: row['street'],
        complement: row['complement'],
        zipCode: row['zip_code'],
        city: row['city'],
        countryCode: row['country_code'],
      });
    }
    return seller;
  }

  async create(createSellerDto: CreateSellerDto): Promise<Seller> {
    let addressId = 0;
    const address = new Address(createSellerDto.address);
    if (address?.isNotEmpty() && address?.isValid()) {
      await this.addressesRepository.create(address);
      addressId = address.id;
    }
    const insertSellerQuery = `INSERT INTO keysell.sellers (uuid, first_name, last_name, email, phone, sex, preferred_language, address_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    return this.databaseService
      .run(insertSellerQuery, [
        uuidv4(),
        createSellerDto.firstName,
        createSellerDto.lastName,
        createSellerDto.email,
        createSellerDto.phone,
        createSellerDto.sex,
        createSellerDto.preferredLanguage,
        addressId || null,
        createSellerDto.createdBy,
      ])
      .then((sellerId: number) => {
        return this.findOne(sellerId);
      });
  }

  async findAll(): Promise<Seller[]> {
    return this.databaseService.all<Seller>(
      'SELECT s.*, a.id AS addressId, a.street, a.complement, a.zip_code, a.city, a.country_code FROM keysell.sellers s LEFT JOIN keysell.addresses a ON s.address_id = a.id ORDER BY created_at ASC',
      undefined,
      this.rowMapper,
    );
  }

  async findOne(id: number): Promise<Seller> {
    return this.databaseService.get<Seller>(
      'SELECT s.*, a.id AS addressId, a.street, a.complement, a.zip_code, a.city, a.country_code FROM keysell.sellers s LEFT JOIN keysell.addresses a ON s.address_id = a.id WHERE s.id = ?',
      [id],
      this.rowMapper,
    );
  }

  async update(id: number, updateSellerDto: UpdateSellerDto): Promise<Seller> {
    const address = new Address(updateSellerDto.address);
    let addressId = address.id;
    if (address?.isNotEmpty() && address?.isValid()) {
      if (addressId > 0) {
        await this.addressesRepository.update(addressId, address);
      } else {
        await this.addressesRepository.create(address);
        addressId = address.id;
      }
    } else if (addressId > 0) {
      this.addressesRepository.remove(addressId);
      addressId = 0;
    }
    const updateQuery = `
      UPDATE keysell.sellers
      SET first_name = ?,
          last_name = ?,
          email = ?,
          phone = ?,
          sex = ?,
          preferred_language = ?,
          address_id = ?,
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
        addressId || null,
        updateSellerDto.updatedBy,
        id,
      ])
      .then(() => {
        const selectQuery = `SELECT * FROM keysell.sellers WHERE id =?`;
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
        .run('DELETE FROM keysell.sellers WHERE id = ?', [id])
        .then(() => {
          this.databaseService
            .get<{ count: number }>(
              'SELECT COUNT(*) as count FROM keysell.sellers WHERE id = ?',
              [id],
            )
            .then((result: { count: number }) => resolve(result.count === 0))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }
}
