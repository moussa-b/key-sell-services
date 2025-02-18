import { Injectable } from '@nestjs/common';
import { DatabaseService } from './db/database-service';
import { Address } from './models/address.entity';

@Injectable()
export class AddressesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  rowMapper(row: any): Address {
    return new Address({
      id: row['id'],
      street: row['street'],
      complement: row['complement'],
      zipCode: row['zip_code'],
      city: row['city'],
      countryCode: row['country_code'],
    });
  }

  async create(address: Address): Promise<Address> {
    const insertAddressQuery = `INSERT INTO addresses (street, complement, zip_code, city, country_code)
                                VALUES (?, ?, ?, ?, ?)`;
    const addressId = await this.databaseService.run(insertAddressQuery, [
      address.street,
      address.complement,
      address.zipCode,
      address.city,
      address.countryCode,
    ]);
    address.id = addressId;
    return address;
  }

  findOne(addressId: number) {
    return this.databaseService.get<Address>(
      'SELECT * FROM addresses WHERE id = ?',
      [addressId],
      this.rowMapper,
    );
  }

  update(addressId: number, address: Address) {
    const updateQuery = `
        UPDATE addresses
        SET street       = ?,
            complement   = ?,
            zip_code     = ?,
            city         = ?,
            country_code = ?
        WHERE id = ?`;
    return this.databaseService
      .run(updateQuery, [
        address.street || null,
        address.complement || null,
        address.zipCode || null,
        address.city || null,
        address.countryCode || null,
        addressId,
      ])
      .then(() => {
        return this.findOne(addressId);
      });
  }

  remove(addressId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return this.databaseService
        .run('DELETE FROM addresses WHERE id = ?', [addressId])
        .then(() => {
          this.databaseService
            .get<{ count: number }>(
              'SELECT COUNT(*) as count FROM addresses WHERE id = ?',
              [addressId],
            )
            .then((result: { count: number }) => resolve(result.count === 0))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }
}
