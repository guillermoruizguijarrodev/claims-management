import { ClaimStatus } from './claim-status';


export interface UpdateClaimRequest { 
  title?: string;
  description?: string;
  status?: ClaimStatus;
  totalAmount?: number;
}
export namespace UpdateClaimRequest {
}


