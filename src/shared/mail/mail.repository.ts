import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../db/database-service';
import { MailAudit } from './entities/mail-audit.entity';

@Injectable()
export class MailRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(mailAudit: MailAudit): Promise<MailAudit> {
    const insertQuery = `INSERT INTO keysell.emails (message_id, email_to, email_from, subject, content, sent_by_user_id, user_id, seller_id, buyer_id, sent_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    return this.databaseService
      .run(insertQuery, [
        mailAudit.messageId,
        mailAudit.to?.join(','),
        mailAudit.from,
        mailAudit.subject,
        mailAudit.content,
        mailAudit.sentByUserId,
        mailAudit.userId,
        mailAudit.sellerId,
        mailAudit.buyerId,
        new Date(),
      ])
      .then(() => {
        return mailAudit;
      });
  }
}
