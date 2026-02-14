import { DamageSeverity } from './damage-severity';


export interface UpdateDamageRequest { 
  part: string;
  severity: DamageSeverity;
  price: number;
  imageUrl: string;
}
export namespace UpdateDamageRequest {
}


