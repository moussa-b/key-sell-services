import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateClientDto } from '../clients/dto/update-client.dto';
import { UserRole } from './entities/user-role.enum';
import { User } from './entities/user.entity';
import { ResponseStatus } from '../shared/dto/response-status.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConnectedUser } from '../shared/models/current-user';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: User,
  })
  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<User> {
    createUserDto.createdBy = user.id;
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Retrieve a list of all users' })
  @ApiResponse({ status: 200, description: 'A list of users.', type: [User] })
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve a user by ID' })
  @ApiResponse({ status: 200, description: 'The user data.', type: User })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const client = await this.usersService.findOne(+id);
    if (!client) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return client;
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<User> {
    updateClientDto.updatedBy = user.id;
    return this.usersService.update(+id, updateClientDto);
  }

  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
    type: ResponseStatus,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string): Promise<ResponseStatus> {
    if (+id === 1) {
      throw new BadRequestException(`User with ID ${id} can not be deleted`);
    }
    const client = await this.usersService.findOne(+id);
    if (!client) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { status: await this.usersService.remove(+id) };
  }
}
