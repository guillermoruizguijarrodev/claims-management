import { ClaimStatus } from './claim-status';
import { Damage } from './damage';


export interface Claim { 
  id: string;
  title: string;
  description?: string;
  status: ClaimStatus;
  /**
   * Calculated by the backend
   */
  totalAmount: number;
  damages: Array<Damage>;
}
export namespace Claim {
}


