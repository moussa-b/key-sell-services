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
import { SendEmailDto } from '../shared/dto/send-email.dto';
import { ResponseStatus } from '../shared/dto/response-status.dto';
import { MailAudit } from '../shared/mail/entities/mail-audit.entity';
import { I18nService } from 'nestjs-i18n';
import { UserRole } from './entities/user-role.enum';
import { UserAccess } from './entities/user-access.entity';
import {
  UserAccessConfiguration,
  UserAccessGroup,
} from './entities/user-access.configuration';
import { LabelValue } from '../shared/dto/label-value.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly i18nService: I18nService,
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
    const subject = this.i18nService.translate(
      'mail.email_confirmation.greeting',
      {
        lang: user.preferredLanguage || 'fr',
      },
    );
    this.mailService.sendEmail(
      user.email,
      subject,
      {
        template: './confirmation',
        context: { name: user.firstName, url, lang: user.preferredLanguage },
      },
      new MailAudit({ sentByUserId: createUserDto.createdBy }),
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

  async findByEmailOrUsername(
    email: string,
    includeUserAccess = false,
  ): Promise<User> {
    return this.usersRepository.findByEmailOrUsername(email, includeUserAccess);
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
    const subject = this.i18nService.translate('mail.password_reset.subject', {
      lang: user.preferredLanguage || 'fr',
    });
    this.mailService.sendEmail(user.email, subject, {
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

  async sendEmail(
    userEmail: string,
    sendEmailDto: SendEmailDto,
  ): Promise<ResponseStatus> {
    const result: false | void = await this.mailService.sendEmail(
      userEmail,
      sendEmailDto.subject,
      {
        text: sendEmailDto.messageText,
        html: sendEmailDto.messageHtml,
      },
      new MailAudit(sendEmailDto),
    );
    return { status: result !== false };
  }

  async getUserAccessConfiguration(
    userId: number,
    role: UserRole,
    acceptLanguage: string,
  ): Promise<UserAccessConfiguration> {
    const userAccessConfiguration: UserAccessConfiguration =
      await this.usersRepository.getUserAccessConfiguration(userId, true);
    userAccessConfiguration.roleUserAccess = new UserAccess({ role });
    if (!userAccessConfiguration.userAccess) {
      userAccessConfiguration.userAccess = new UserAccess({ role });
    }
    const fieldsToRemove: string[] = [];
    if (userAccessConfiguration.globalUserAccess) {
      for (const key in userAccessConfiguration.globalUserAccess) {
        if (userAccessConfiguration.globalUserAccess[key] === false) {
          fieldsToRemove.push(key);
        }
      }
    }
    userAccessConfiguration.groups = this.getUserAccessGroups(
      acceptLanguage,
      fieldsToRemove,
    );
    delete userAccessConfiguration.globalUserAccess;
    return userAccessConfiguration;
  }

  private getUserAccessGroups(
    acceptLanguage: string,
    fieldsToRemove: string[],
  ): UserAccessGroup[] {
    return [
      {
        label: this.i18nService.translate('user_access.real_estates_module', {
          lang: acceptLanguage,
        }),
        fields: [
          {
            value: 'canShowRealEstate',
            label: this.i18nService.translate(
              'user_access.can_show_real_estate',
              { lang: acceptLanguage },
            ),
          },
          {
            value: 'canEditRealEstate',
            label: this.i18nService.translate(
              'user_access.can_edit_real_estate',
              { lang: acceptLanguage },
            ),
          },
        ].filter(
          (item: LabelValue<string>) => !fieldsToRemove.includes(item.value),
        ),
      },
      {
        label: this.i18nService.translate('user_access.sellers_module', {
          lang: acceptLanguage,
        }),
        fields: [
          {
            value: 'canShowSellers',
            label: this.i18nService.translate('user_access.can_show_sellers', {
              lang: acceptLanguage,
            }),
          },
          {
            value: 'canEditSellers',
            label: this.i18nService.translate('user_access.can_edit_sellers', {
              lang: acceptLanguage,
            }),
          },
        ].filter(
          (item: LabelValue<string>) => !fieldsToRemove.includes(item.value),
        ),
      },
      {
        label: this.i18nService.translate('user_access.buyers_module', {
          lang: acceptLanguage,
        }),
        fields: [
          {
            value: 'canShowBuyers',
            label: this.i18nService.translate('user_access.can_show_buyers', {
              lang: acceptLanguage,
            }),
          },
          {
            value: 'canEditBuyers',
            label: this.i18nService.translate('user_access.can_edit_buyers', {
              lang: acceptLanguage,
            }),
          },
        ].filter(
          (item: LabelValue<string>) => !fieldsToRemove.includes(item.value),
        ),
      },
      {
        label: this.i18nService.translate('user_access.calendar_module', {
          lang: acceptLanguage,
        }),
        fields: [
          {
            value: 'canShowCalendarEvents',
            label: this.i18nService.translate(
              'user_access.can_show_calendar_events',
              {
                lang: acceptLanguage,
              },
            ),
          },
          {
            value: 'canEditCalendarEvents',
            label: this.i18nService.translate(
              'user_access.can_edit_calendar_events',
              {
                lang: acceptLanguage,
              },
            ),
          },
        ].filter(
          (item: LabelValue<string>) => !fieldsToRemove.includes(item.value),
        ),
      },
      {
        label: this.i18nService.translate('user_access.users_module', {
          lang: acceptLanguage,
        }),
        fields: [
          {
            value: 'canShowUsers',
            label: this.i18nService.translate('user_access.can_show_users', {
              lang: acceptLanguage,
            }),
          },
          {
            value: 'canEditUsers',
            label: this.i18nService.translate('user_access.can_edit_users', {
              lang: acceptLanguage,
            }),
          },
          {
            value: 'canShowUsersAccess',
            label: this.i18nService.translate(
              'user_access.can_show_users_access',
              { lang: acceptLanguage },
            ),
          },
          {
            value: 'canEditUsersAccess',
            label: this.i18nService.translate(
              'user_access.can_edit_users_access',
              { lang: acceptLanguage },
            ),
          },
        ].filter(
          (item: LabelValue<string>) => !fieldsToRemove.includes(item.value),
        ),
      },
      {
        label: this.i18nService.translate('user_access.miscellaneous_module', {
          lang: acceptLanguage,
        }),
        fields: [
          {
            value: 'canSendEmail',
            label: this.i18nService.translate('user_access.can_send_email', {
              lang: acceptLanguage,
            }),
          },
        ].filter(
          (item: LabelValue<string>) => !fieldsToRemove.includes(item.value),
        ),
      },
    ].filter((group: UserAccessGroup) => group.fields.length > 0);
  }

  async updateUserAccess(
    userId: number,
    userAccess: UserAccess,
  ): Promise<UserAccess> {
    return this.usersRepository.updateUserAccess(userId, userAccess);
  }
}
