import { Injectable } from '@nestjs/common';
import { Buyer } from './entities/buyer.entity';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../shared/db/database-service';
import { UpdateBuyerDto } from './dto/update-buyer.dto';
import { DateUtils } from '../utils/date-utils';
import { AddressesRepository } from '../shared/addresses.repository';
import { Address } from '../shared/models/address.entity';

@Injectable()
export class BuyersRepository {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly addressesRepository: AddressesRepository,
  ) {}

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
    buyer.budget = row['budget'];
    buyer.budgetCurrency = row['budget_currency'];
    buyer.createdBy = row['created_by'];
    buyer.createdAt =
      row['created_at'] instanceof Date
        ? row['created_at']
        : DateUtils.createDateFromDatabaseDate(row['created_at']);
    buyer.updatedBy = row['updated_by'];
    buyer.updatedAt =
      row['updated_at'] instanceof Date
        ? row['updated_at']
        : DateUtils.createDateFromDatabaseDate(row['updated_at']);
    if (row['addressId']) {
      buyer.address = new Address({
        id: row['addressId'],
        street: row['street'],
        complement: row['complement'],
        zipCode: row['zip_code'],
        city: row['city'],
        countryCode: row['country_code'],
      });
    }
    return buyer;
  }

  async create(createBuyerDto: CreateBuyerDto): Promise<Buyer> {
    let addressId = 0;
    const address = new Address(createBuyerDto.address);
    if (address?.isNotEmpty() && address?.isValid()) {
      await this.addressesRepository.create(address);
      addressId = address.id;
    }
    const insertBuyerQuery = `INSERT INTO buyers (uuid, first_name, last_name, email, phone, sex, preferred_language,
                                                  budget, budget_currency, address_id, created_by)
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    return this.databaseService
      .run(insertBuyerQuery, [
        uuidv4(),
        createBuyerDto.firstName,
        createBuyerDto.lastName,
        createBuyerDto.email,
        createBuyerDto.phone,
        createBuyerDto.sex,
        createBuyerDto.preferredLanguage,
        createBuyerDto.budget,
        createBuyerDto.budgetCurrency,
        addressId || undefined,
        createBuyerDto.createdBy,
      ])
      .then((buyerId: number) => {
        return this.findOne(buyerId);
      });
  }

  async findAll(): Promise<Buyer[]> {
    return this.databaseService.all<Buyer>(
      'SELECT b.*, a.id AS addressId, a.street, a.complement, a.zip_code, a.city, a.country_code FROM buyers b LEFT JOIN addresses a ON b.address_id = a.id ORDER BY created_at ASC',
      undefined,
      this.rowMapper,
    );
  }

  async findOne(id: number): Promise<Buyer> {
    return this.databaseService.get<Buyer>(
      'SELECT b.*, a.id AS addressId, a.street, a.complement, a.zip_code, a.city, a.country_code FROM buyers b LEFT JOIN addresses a ON b.address_id = a.id WHERE b.id = ?',
      [id],
      this.rowMapper,
    );
  }

  async update(id: number, updateBuyerDto: UpdateBuyerDto): Promise<Buyer> {
    const address = new Address(updateBuyerDto.address);
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
        UPDATE buyers
        SET first_name         = ?,
            last_name          = ?,
            email              = ?,
            phone              = ?,
            sex                = ?,
            preferred_language = ?,
            budget             = ?,
            budget_currency    = ?,
            address_id         = ?,
            updated_by         = ?
        WHERE id = ?`;
    return this.databaseService
      .run(updateQuery, [
        updateBuyerDto.firstName || null,
        updateBuyerDto.lastName || null,
        updateBuyerDto.email || null,
        updateBuyerDto.phone || null,
        updateBuyerDto.sex || null,
        updateBuyerDto.preferredLanguage || null,
        updateBuyerDto.budget || null,
        updateBuyerDto.budgetCurrency || null,
        addressId || null,
        updateBuyerDto.updatedBy,
        id,
      ])
      .then(() => {
        return this.findOne(id);
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
