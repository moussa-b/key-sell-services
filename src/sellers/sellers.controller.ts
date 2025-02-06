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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { Seller } from './entities/seller.entity';
import { ResponseStatus } from '../shared/dto/response-status.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConnectedUser } from '../shared/models/current-user';

@ApiTags('Sellers')
@Controller('sellers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @ApiOperation({ summary: 'Create a new seller' })
  @ApiResponse({
    status: 201,
    description: 'The seller has been successfully created.',
    type: Seller,
  })
  @Post()
  @Roles(UserRole.ADMIN)
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
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Seller> {
    const seller = await this.sellersService.findOne(+id);
    if (!seller) {
      throw new NotFoundException(`Seller with ID ${id} not found`);
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
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateSellerDto: UpdateSellerDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<Seller> {
    updateSellerDto.updatedBy = user.id;
    const seller = await this.sellersService.findOne(+id);
    if (!seller) {
      throw new NotFoundException(`Seller with ID ${id} not found`);
    }
    return this.sellersService.update(+id, updateSellerDto);
  }

  @ApiOperation({ summary: 'Delete a seller by ID' })
  @ApiResponse({
    status: 200,
    description: 'The seller has been successfully deleted.',
    type: ResponseStatus,
  })
  @ApiResponse({ status: 404, description: 'Seller not found.' })
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string): Promise<ResponseStatus> {
    const seller = await this.sellersService.findOne(+id);
    if (!seller) {
      throw new NotFoundException(`Seller with ID ${id} not found`);
    }
    return { status: await this.sellersService.remove(+id) };
  }
}
