export class MailAudit {
  messageId: string;
  to: string[];
  from: string;
  subject: string;
  content: string;
  sentByUserId: number;
  userId?: number;
  sellerId?: number;
  buyerId?: number;
  sentAt: Date;

  constructor(options: { [key: string]: any }) {
    this.messageId = options['messageId'];
    this.to = options['to'];
    this.from = options['from'];
    this.content = options['content'];
    this.sentByUserId = options['sentByUserId'];
    this.userId = options['userId'];
    this.sellerId = options['sellerId'];
    this.buyerId = options['buyerId'];
    this.sentAt = options['sentAt'];
    this.subject = options['subject'];
  }
}
