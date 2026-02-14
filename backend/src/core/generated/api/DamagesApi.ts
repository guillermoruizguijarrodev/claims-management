import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Claim, CreateDamageDto, UpdateDamageRequest,  } from '../models';


@Injectable()
export abstract class DamagesApi {

  abstract addDamage(id: string, createDamageDto: CreateDamageDto,  request: Request): Claim | Promise<Claim> | Observable<Claim>;


  abstract deleteDamage(id: string, damageId: string,  request: Request): Claim | Promise<Claim> | Observable<Claim>;


  abstract updateDamage(id: string, damageId: string, updateDamageRequest: UpdateDamageRequest,  request: Request): Claim | Promise<Claim> | Observable<Claim>;

} 