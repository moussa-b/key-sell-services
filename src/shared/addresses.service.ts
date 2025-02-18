import { Injectable } from '@nestjs/common';
import { AddressesRepository } from './addresses.repository';
import { Address } from './models/address.entity';

@Injectable()
export class AddressesService {
  constructor(private readonly addressesRepository: AddressesRepository) {}

  async create(address: Address): Promise<Address> {
    return this.addressesRepository.create(address);
  }

  async findOne(addressId: number): Promise<Address> {
    return this.addressesRepository.findOne(addressId);
  }

  async update(addressId: number, address: Address): Promise<Address> {
    return this.addressesRepository.update(addressId, address);
  }

  async remove(addressId: number): Promise<boolean> {
    return this.addressesRepository.remove(addressId);
  }
}
