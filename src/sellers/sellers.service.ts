import { Injectable } from '@nestjs/common';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { SellersRepository } from './sellers.repository';
import { Seller } from './entities/seller.entity';

@Injectable()
export class SellersService {
  constructor(private readonly sellerRepository: SellersRepository) {}

  async create(createSellerDto: CreateSellerDto): Promise<Seller> {
    return this.sellerRepository.create(createSellerDto);
  }

  async findAll(): Promise<Seller[]> {
    return this.sellerRepository.findAll();
  }

  async findOne(id: number): Promise<Seller> {
    return this.sellerRepository.findOne(id);
  }

  async update(id: number, updateSellerDto: UpdateSellerDto): Promise<Seller> {
    return this.sellerRepository.update(id, updateSellerDto);
  }

  async remove(id: number): Promise<boolean> {
    return this.sellerRepository.remove(id);
  }
}
