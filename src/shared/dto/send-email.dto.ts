export class SendEmailDto {
  subject: string;
  messageText: string;
  messageHtml: string;
  buyerId?: number;
  sellerId?: number;
  userId?: number;
  sentByUserId: number;
}
