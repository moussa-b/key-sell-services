import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { MailService } from '../shared/mail/mail.service';
import { ActivateUserDto } from './dto/activate-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserSecurityDto } from './dto/update-user-security.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;

    const existingUser =
      await this.usersRepository.findByEmailOrUsername(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;
    const activationToken = uuidv4();

    const user = await this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      activationToken,
      isActive: false,
    });

    const url = `${this.configService.get<string>('FRONT_END_URL')}/activate?token=${activationToken}&username=${createUserDto.username || createUserDto.email}`;

    await this.mailService.sendEmail(
      user.email,
      'Welcome! Confirm your Email',
      {
        template: './confirmation',
        context: { name: user.firstName, url, lang: user.preferredLanguage },
      },
    );

    return user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async findOne(
    id: number,
    includePassword = false,
    includeUsername = false,
  ): Promise<User> {
    return this.usersRepository.findOne(id, includePassword, includeUsername);
  }

  async update(id: number, updateClientDto: UpdateUserDto): Promise<User> {
    return this.usersRepository.update(id, updateClientDto);
  }

  async remove(id: number): Promise<boolean> {
    return this.usersRepository.remove(id);
  }

  async findByEmailOrUsername(email: string): Promise<User> {
    return this.usersRepository.findByEmailOrUsername(email);
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByActivationToken(token: string): Promise<User | null> {
    return this.usersRepository.findByActivationToken(token);
  }

  async findByResetPasswordToken(token: string): Promise<User | null> {
    return this.usersRepository.findByResetPasswordToken(token);
  }

  async activateUser(activateUserDto: ActivateUserDto): Promise<boolean> {
    const user = await this.findByActivationToken(
      activateUserDto.activationToken,
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const hashedPassword = await bcrypt.hash(activateUserDto.password, 10);
    return this.usersRepository.activateUser(user.id, hashedPassword);
  }

  async setResetPasswordToken(
    id: number,
    resetPasswordToken: string,
    expires: Date,
  ): Promise<void> {
    await this.usersRepository.setResetPasswordToken(
      id,
      resetPasswordToken,
      expires,
    );
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<boolean> {
    const user = await this.findByResetPasswordToken(
      resetPasswordDto.resetPasswordToken,
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);
    return this.usersRepository.resetPassword(user.id, hashedPassword);
  }

  async forgotPassword(email: string) {
    const user = await this.findByEmailOrUsername(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const resetPasswordToken = uuidv4();
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    await this.setResetPasswordToken(user.id, resetPasswordToken, expires);
    const url = `${this.configService.get<string>('FRONT_END_URL')}/reset-password?token=${resetPasswordToken}&username=${user.username || user.email}`;
    await this.mailService.sendEmail(user.email, 'Password Reset Request', {
      template: './reset-password',
      context: {
        name: user.firstName,
        url,
        lang: user.preferredLanguage || 'fr',
      },
    });
    return true;
  }

  async updateProfileSecurity(
    userId: number,
    updateUserSecurityDto: UpdateUserSecurityDto,
  ) {
    if (updateUserSecurityDto.newPassword?.length > 0) {
      updateUserSecurityDto.newPassword = await bcrypt.hash(
        updateUserSecurityDto.newPassword,
        10,
      );
    }
    return this.usersRepository.updateProfileSecurity(
      userId,
      updateUserSecurityDto,
    );
  }
}
