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
import { BuyersService } from './buyers.service';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { Buyer } from './entities/buyer.entity';
import { ResponseStatus } from '../shared/dto/response-status.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConnectedUser } from '../shared/models/current-user';

@ApiTags('Buyers')
@Controller('buyers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) {}

  @ApiOperation({ summary: 'Create a new buyer' })
  @ApiResponse({
    status: 201,
    description: 'The buyer has been successfully created.',
    type: Buyer,
  })
  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @Body() createBuyerDto: CreateBuyerDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<Buyer> {
    createBuyerDto.createdBy = user.id;
    return this.buyersService.create(createBuyerDto);
  }

  @ApiOperation({ summary: 'Retrieve a list of all buyers' })
  @ApiResponse({
    status: 200,
    description: 'List of all buyers.',
    type: [Buyer],
  })
  @Get()
  findAll(): Promise<Buyer[]> {
    return this.buyersService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve a buyer by ID' })
  @ApiResponse({
    status: 200,
    description: 'The buyer with the given ID.',
    type: Buyer,
  })
  @ApiResponse({
    status: 404,
    description: 'Buyer not found.',
  })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Buyer> {
    const buyer = await this.buyersService.findOne(+id);
    if (!buyer) {
      throw new NotFoundException(`Buyer with ID ${id} not found`);
    }
    return buyer;
  }

  @ApiOperation({ summary: 'Update a buyer' })
  @ApiResponse({
    status: 200,
    description: 'The buyer has been successfully updated.',
    type: Buyer,
  })
  @ApiResponse({ status: 404, description: 'Buyer not found.' })
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateBuyerDto: UpdateBuyerDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<Buyer> {
    updateBuyerDto.updatedBy = user.id;
    const buyer = await this.buyersService.findOne(+id);
    if (!buyer) {
      throw new NotFoundException(`Buyer with ID ${id} not found`);
    }
    return this.buyersService.update(+id, updateBuyerDto);
  }

  @ApiOperation({ summary: 'Delete a buyer by ID' })
  @ApiResponse({
    status: 200,
    description: 'The buyer has been successfully deleted.',
    type: ResponseStatus,
  })
  @ApiResponse({ status: 404, description: 'Buyer not found.' })
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string): Promise<ResponseStatus> {
    const buyer = await this.buyersService.findOne(+id);
    if (!buyer) {
      throw new NotFoundException(`Buyer with ID ${id} not found`);
    }
    return { status: await this.buyersService.remove(+id) };
  }
}
