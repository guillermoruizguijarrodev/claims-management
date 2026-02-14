import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Claim, CreateClaimDto, UpdateClaimRequest,  } from '../models';


@Injectable()
export abstract class ClaimsApi {

  abstract createClaim(createClaimDto: CreateClaimDto,  request: Request): Claim | Promise<Claim> | Observable<Claim>;


  abstract getClaimById(id: string,  request: Request): Claim | Promise<Claim> | Observable<Claim>;


  abstract getClaims( request: Request): Array<Claim> | Promise<Array<Claim>> | Observable<Array<Claim>>;


  abstract updateClaim(id: string, updateClaimRequest: UpdateClaimRequest,  request: Request): Claim | Promise<Claim> | Observable<Claim>;

} 