import { CreateSellerDto } from './create-seller.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateSellerDto extends PartialType(CreateSellerDto) {}
