import { LabelValue } from '../../shared/dto/label-value.dto';
import { RealEstate } from '../entities/real-estate.entity';
import { Media } from '../../medias/entities/media.entity';

export class RealEstateDto extends RealEstate {
  ownersDetails: LabelValue<number>[];
  medias: Media[];
}
