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
import { RealEstatesService } from './real-estates.service';
import { CreateRealEstateDto } from './dto/create-real-estate.dto';
import { UpdateRealEstateDto } from './dto/update-real-estate.dto';
import { RealEstate } from './entities/real-estate.entity';
import { ResponseStatus } from '../shared/dto/response-status.dto';
import { LabelValue } from '../shared/dto/label-value.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConnectedUser } from '../shared/models/current-user';

@Controller('real-estates')
@UseGuards(JwtAuthGuard)
export class RealEstatesController {
  constructor(private readonly realEstateService: RealEstatesService) {}

  @Post()
  create(
    @Body() createRealEstateDto: CreateRealEstateDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<RealEstate> {
    createRealEstateDto.createdBy = user.id;
    return this.realEstateService.create(createRealEstateDto);
  }

  @Get()
  findAll(): Promise<RealEstate[]> {
    return this.realEstateService.findAll();
  }

  @Get('owners') // must come before @Get(':id')
  findAllOwners(): Promise<LabelValue<number>[]> {
    return this.realEstateService.findAllOwners();
  }

  @Get(':id')
  findOne(@Param('id') realEstateId: string): Promise<RealEstate> {
    return this.realEstateService.findOne(+realEstateId);
  }

  @Patch(':id')
  update(
    @Param('id') realEstateId: string,
    @Body() updateRealEstateDto: UpdateRealEstateDto,
  ): Promise<RealEstate> {
    return this.realEstateService.update(+realEstateId, updateRealEstateDto);
  }

  @Delete(':id')
  async remove(@Param('id') realEstateId: string): Promise<ResponseStatus> {
    const realEstate = await this.realEstateService.findOne(+realEstateId);
    if (!realEstate) {
      throw new NotFoundException(
        `Real estate with ID ${realEstateId} not found`,
      );
    }
    return {
      status: await this.realEstateService.remove(
        +realEstateId,
        realEstate.address?.id,
      ),
    };
  }
}
