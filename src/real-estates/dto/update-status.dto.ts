import { RealEstateStatus } from '../entities/real-estate-status.enum';

export class UpdateStatusDto {
  status: RealEstateStatus;
  statusRemark: string;
}
