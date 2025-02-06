import { Injectable } from '@nestjs/common';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';
import { BuyersRepository } from './buyers.repository';
import { Buyer } from './entities/buyer.entity';

@Injectable()
export class BuyersService {
  constructor(private readonly buyerRepository: BuyersRepository) {}

  async create(createBuyerDto: CreateBuyerDto): Promise<Buyer> {
    return this.buyerRepository.create(createBuyerDto);
  }

  async findAll(): Promise<Buyer[]> {
    return this.buyerRepository.findAll();
  }

  async findOne(id: number): Promise<Buyer> {
    return this.buyerRepository.findOne(id);
  }

  async update(id: number, updateBuyerDto: UpdateBuyerDto): Promise<Buyer> {
    return this.buyerRepository.update(id, updateBuyerDto);
  }

  async remove(id: number): Promise<boolean> {
    return this.buyerRepository.remove(id);
  }
}
