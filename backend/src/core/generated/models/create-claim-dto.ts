import { CreateDamageDto } from './create-damage-dto';


export interface CreateClaimDto { 
  title: string;
  description: string;
  damages?: Array<CreateDamageDto>;
}

