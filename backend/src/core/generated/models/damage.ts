import { DamageSeverity } from './damage-severity';


export interface Damage { 
  id: string;
  part: string;
  severity: DamageSeverity;
  imageUrl: string;
  price: number;
}
export namespace Damage {
}


