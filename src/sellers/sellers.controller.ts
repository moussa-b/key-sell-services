import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SellersService } from './sellers.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Seller } from './entities/seller.entity';
import { ResponseStatus } from '../shared/dto/response-status.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConnectedUser } from '../shared/models/current-user';
import { SendEmailDto } from '../shared/dto/send-email.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@ApiTags('Sellers')
@Controller('sellers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @ApiOperation({ summary: 'Create a new seller' })
  @ApiResponse({
    status: 201,
    description: 'The seller has been successfully created.',
    type: Seller,
  })
  @Post()
  @Permissions('canEditSellers')
  create(
    @Body() createSellerDto: CreateSellerDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<Seller> {
    createSellerDto.createdBy = user.id;
    return this.sellersService.create(createSellerDto);
  }

  @ApiOperation({ summary: 'Retrieve a list of all sellers' })
  @ApiResponse({
    status: 200,
    description: 'List of all sellers.',
    type: [Seller],
  })
  @Get()
  @Permissions('canShowSellers')
  findAll(): Promise<Seller[]> {
    return this.sellersService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve a seller by ID' })
  @ApiResponse({
    status: 200,
    description: 'The seller with the given ID.',
    type: Seller,
  })
  @ApiResponse({
    status: 404,
    description: 'Seller not found.',
  })
  @Get(':sellerId')
  @Permissions('canShowSellers')
  async findOne(@Param('sellerId') sellerId: string): Promise<Seller> {
    const seller = await this.sellersService.findOne(+sellerId);
    if (!seller) {
      throw new NotFoundException(`Seller with ID ${sellerId} not found`);
    }
    return seller;
  }

  @ApiOperation({ summary: 'Update a seller' })
  @ApiResponse({
    status: 200,
    description: 'The seller has been successfully updated.',
    type: Seller,
  })
  @ApiResponse({ status: 404, description: 'Seller not found.' })
  @Patch(':sellerId')
  @Permissions('canEditSellers')
  async update(
    @Param('sellerId') sellerId: string,
    @Body() updateSellerDto: UpdateSellerDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<Seller> {
    updateSellerDto.updatedBy = user.id;
    const seller = await this.sellersService.findOne(+sellerId);
    if (!seller) {
      throw new NotFoundException(`Seller with ID ${sellerId} not found`);
    }
    return this.sellersService.update(+sellerId, updateSellerDto);
  }

  @ApiOperation({ summary: 'Delete a seller by ID' })
  @ApiResponse({
    status: 200,
    description: 'The seller has been successfully deleted.',
    type: ResponseStatus,
  })
  @ApiResponse({ status: 404, description: 'Seller not found.' })
  @Delete(':sellerId')
  @Permissions('canEditSellers')
  async remove(@Param('sellerId') sellerId: string): Promise<ResponseStatus> {
    const seller = await this.sellersService.findOne(+sellerId);
    if (!seller) {
      throw new NotFoundException(`Seller with ID ${sellerId} not found`);
    }
    return {
      status: await this.sellersService.remove(+sellerId, seller.address?.id),
    };
  }

  @ApiOperation({ summary: 'Send email to a seller' })
  @ApiResponse({
    status: 200,
    description: 'The email has been successfully sent to the seller.',
    type: ResponseStatus,
  })
  @ApiResponse({ status: 404, description: 'Seller not found.' })
  @Post(':sellerId/email/sent')
  @Permissions('canSendEmail')
  async sendEmail(
    @Param('sellerId') sellerId: string,
    @Body() sendEmailDto: SendEmailDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<ResponseStatus> {
    sendEmailDto.sentByUserId = user.id;
    const seller = await this.sellersService.findOne(+sellerId);
    if (!seller) {
      throw new NotFoundException(`Seller with ID ${sellerId} not found`);
    }
    sendEmailDto.sellerId = +sellerId;
    return this.sellersService.sendEmail(seller.email, sendEmailDto);
  }
}
