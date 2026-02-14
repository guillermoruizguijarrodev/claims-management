import { DamageSeverity } from './damage-severity';


export interface CreateDamageDto { 
  part: string;
  severity: DamageSeverity;
  imageUrl: string;
  price: number;
}
export namespace CreateDamageDto {
}


