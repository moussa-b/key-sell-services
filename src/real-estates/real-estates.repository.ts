import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../shared/db/database-service';
import { AddressesRepository } from '../shared/addresses.repository';
import { CreateRealEstateDto } from './dto/create-real-estate.dto';
import { UpdateRealEstateDto } from './dto/update-real-estate.dto';
import { LabelValue } from '../shared/dto/label-value.dto';
import { RealEstate } from './entities/real-estate.entity';
import { Address } from '../shared/models/address.entity';
import { RealEstateType } from './entities/real-estate-type.enum';
import { DateUtils } from '../utils/date-utils';

@Injectable()
export class RealEstatesRepository {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly addressesRepository: AddressesRepository,
  ) {}

  labelValueRowMapper(row: any): LabelValue<number> {
    const labelValue = new LabelValue<number>();
    labelValue.label = row['label'];
    labelValue.value = row['value'];
    return labelValue;
  }

  rowMapper(row: any): RealEstate {
    const realEstate = new RealEstate();
    realEstate.id = row['id'];
    realEstate.type = row['type'] || RealEstateType.NONE;
    realEstate.terraced = row['terraced'];
    realEstate.surface = row['surface'];
    realEstate.roomCount = row['room_count'];
    realEstate.showerCount = row['shower_count'];
    realEstate.terraceCount = row['terrace_count'];
    realEstate.hasGarden = row['has_garden'];
    realEstate.gardenSurface = row['garden_surface'];
    realEstate.isSecured = row['is_secured'];
    realEstate.securityDetail = row['security_detail'];
    realEstate.facadeCount = row['facade_count'];
    realEstate.location = row['location'];
    realEstate.price = row['price'];
    realEstate.priceCurrency = row['price_currency'];
    realEstate.remark = row['remark'];
    realEstate.createdBy = row['created_by'];
    realEstate.createdAt =
      row['created_at'] instanceof Date
        ? row['created_at']
        : DateUtils.createDateFromDatabaseDate(row['created_at']);
    realEstate.updatedBy = row['updated_by'];
    realEstate.updatedAt =
      row['updated_at'] instanceof Date
        ? row['updated_at']
        : DateUtils.createDateFromDatabaseDate(row['updated_at']);
    if (row['owners']) {
      const owners: number[] = JSON.parse(row['owners']);
      realEstate.owners = owners.filter((owner: number) => !!owner);
    }
    if (row['addressId']) {
      realEstate.address = new Address({
        id: row['addressId'],
        street: row['street'],
        complement: row['complement'],
        zipCode: row['zip_code'],
        city: row['city'],
        countryCode: row['country_code'],
      });
    }
    return realEstate;
  }

  async create(createRealEstateDto: CreateRealEstateDto): Promise<RealEstate> {
    let addressId = 0;
    const address = new Address(createRealEstateDto.address);
    if (address?.isNotEmpty() && address?.isValid()) {
      await this.addressesRepository.create(address);
      addressId = address.id;
    }
    const insertQuery = `INSERT INTO real_estates (type, terraced, surface, room_count, shower_count, terrace_count,
                                                   has_garden, garden_surface, is_secured, security_detail,
                                                   facade_count, location, price, price_currency, remark, address_id,
                                                   created_by)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    return this.databaseService
      .run(insertQuery, [
        createRealEstateDto.type,
        createRealEstateDto.terraced,
        createRealEstateDto.surface,
        createRealEstateDto.roomCount,
        createRealEstateDto.showerCount,
        createRealEstateDto.terraceCount,
        createRealEstateDto.hasGarden,
        createRealEstateDto.gardenSurface,
        createRealEstateDto.isSecured,
        createRealEstateDto.securityDetail,
        createRealEstateDto.facadeCount,
        createRealEstateDto.location,
        createRealEstateDto.price,
        createRealEstateDto.priceCurrency,
        createRealEstateDto.remark,
        addressId || null,
        createRealEstateDto.createdBy,
      ])
      .then(async (realEstateId: number) => {
        if (createRealEstateDto.owners?.length > 0) {
          const insertOwnerQuery = `REPLACE
          INTO real_estates_sellers (real_estate_id, seller_id)`;
          await this.databaseService.batchInsert(
            insertOwnerQuery,
            createRealEstateDto.owners.map((owner: number) => [
              realEstateId,
              owner,
            ]),
          );
        }
        return this.findOne(realEstateId);
      });
  }

  findAll(): Promise<RealEstate[]> {
    return this.databaseService.all<RealEstate>(
      `SELECT re.*,
              a.id                                         AS addressId,
              a.street,
              a.complement,
              a.zip_code,
              a.city,
              a.country_code,
              COALESCE(JSON_ARRAYAGG(res.seller_id), '[]') AS owners
       FROM real_estates re
                LEFT JOIN addresses a ON re.address_id = a.id
                LEFT JOIN real_estates_sellers res ON re.id = res.real_estate_id
       GROUP BY re.id, a.id
       ORDER BY re.created_at ASC`,
      undefined,
      this.rowMapper,
    );
  }

  findOne(realEstateId: number) {
    return this.databaseService.all<RealEstate>(
      `SELECT re.*,
              a.id                                         AS addressId,
              a.street,
              a.complement,
              a.zip_code,
              a.city,
              a.country_code,
              COALESCE(JSON_ARRAYAGG(res.seller_id), '[]') AS owners
       FROM real_estates re
                LEFT JOIN addresses a ON re.address_id = a.id
                LEFT JOIN real_estates_sellers res ON re.id = res.real_estate_id
       WHERE re.id = ?
       GROUP BY re.id, a.id
       ORDER BY re.created_at ASC`,
      [realEstateId],
      this.rowMapper,
    );
  }

  async update(realEstateId: number, updateRealEstateDto: UpdateRealEstateDto) {
    const address = new Address(updateRealEstateDto.address);
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
        UPDATE real_estates
        SET type            = ?,
            terraced        = ?,
            surface         = ?,
            room_count      = ?,
            shower_count    = ?,
            terrace_count   = ?,
            has_garden      = ?,
            garden_surface  = ?,
            is_secured      = ?,
            security_detail = ?,
            facade_count    = ?,
            location        = ?,
            price           = ?,
            price_currency  = ?,
            remark          = ?,
            address_id      = ?,
            updated_by      = ?
        WHERE id = ?`;
    return this.databaseService
      .run(updateQuery, [
        updateRealEstateDto.type || null,
        updateRealEstateDto.terraced,
        updateRealEstateDto.surface || null,
        updateRealEstateDto.roomCount || null,
        updateRealEstateDto.showerCount || null,
        updateRealEstateDto.terraceCount || null,
        updateRealEstateDto.hasGarden,
        updateRealEstateDto.gardenSurface || null,
        updateRealEstateDto.isSecured,
        updateRealEstateDto.securityDetail || null,
        updateRealEstateDto.facadeCount || null,
        updateRealEstateDto.location || null,
        updateRealEstateDto.price || null,
        updateRealEstateDto.priceCurrency || null,
        updateRealEstateDto.remark || null,
        addressId || null,
        updateRealEstateDto.updatedBy,
        realEstateId,
      ])
      .then(async () => {
        if (updateRealEstateDto.owners?.length > 0) {
          await this.databaseService.run(
            'DELETE FROM real_estates_sellers WHERE real_estate_id = ?',
            [realEstateId],
          );
          const insertOwnerQuery = `INSERT INTO real_estates_sellers (real_estate_id, seller_id)`;
          await this.databaseService.batchInsert(
            insertOwnerQuery,
            updateRealEstateDto.owners.map((owner: number) => [
              realEstateId,
              owner,
            ]),
          );
        }
        return this.findOne(realEstateId);
      });
  }

  remove(realEstateId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return this.databaseService
        .run('DELETE FROM real_estates WHERE id = ?', [realEstateId])
        .then(() => {
          this.databaseService.run(
            'DELETE FROM real_estates_sellers WHERE real_estate_id = ?',
            [realEstateId],
          );
          this.databaseService
            .get<{ count: number }>(
              'SELECT COUNT(*) as count FROM real_estates WHERE id = ?',
              [realEstateId],
            )
            .then((result: { count: number }) => resolve(result.count === 0))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  findAllOwners(): Promise<LabelValue<number>[]> {
    return this.databaseService.all<LabelValue<number>>(
      'SELECT id as value, CONCAT(last_name, " ", first_name) as label FROM keysell.sellers ORDER BY label',
      undefined,
      this.labelValueRowMapper,
    );
  }
}
