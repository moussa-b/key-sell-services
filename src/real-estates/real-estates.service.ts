import { Injectable } from '@nestjs/common';
import { CreateRealEstateDto } from './dto/create-real-estate.dto';
import { UpdateRealEstateDto } from './dto/update-real-estate.dto';
import { RealEstatesRepository } from './real-estates.repository';
import { RealEstate } from './entities/real-estate.entity';
import { LabelValue } from '../shared/dto/label-value.dto';
import { AddressesService } from '../shared/addresses.service';

@Injectable()
export class RealEstatesService {
  constructor(
    private readonly realEstateRepository: RealEstatesRepository,
    private readonly addressesService: AddressesService,
  ) {}

  async create(createRealEstateDto: CreateRealEstateDto): Promise<RealEstate> {
    return this.realEstateRepository.create(createRealEstateDto);
  }

  async findAll(): Promise<RealEstate[]> {
    return this.realEstateRepository.findAll();
  }

  async findOne(realEstateId: number): Promise<RealEstate> {
    return this.realEstateRepository.findOne(realEstateId);
  }

  async update(
    realEstateId: number,
    updateRealEstateDto: UpdateRealEstateDto,
  ): Promise<RealEstate> {
    return this.realEstateRepository.update(realEstateId, updateRealEstateDto);
  }

  async remove(realEstateId: number, addressId: number): Promise<boolean> {
    if (addressId > 0) {
      this.addressesService.remove(addressId);
    }
    return this.realEstateRepository.remove(realEstateId);
  }

  findAllOwners(): Promise<LabelValue<number>[]> {
    return this.realEstateRepository.findAllOwners();
  }
}
