import { Client } from '../../shared/models/client.entity';

export class Buyer extends Client {
  budget: number;
  budgetCurrency: string;
}
