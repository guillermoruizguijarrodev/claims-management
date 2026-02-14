import { Body, Controller, Delete, Patch, Post, Param, Query, Req } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DamagesApi } from '../api';
import type { Claim, CreateDamageDto, UpdateDamageRequest,  } from '../models';

@Controller()
export class DamagesApiController {
  constructor(private readonly damagesApi: DamagesApi) {}

  @Post('/claims/:id/damages')
  addDamage(@Param('id') id: string, @Body() createDamageDto: CreateDamageDto, @Req() request: Request): Claim | Promise<Claim> | Observable<Claim> {
    return this.damagesApi.addDamage(id, createDamageDto, request);
  }

  @Delete('/claims/:id/damages/:damageId')
  deleteDamage(@Param('id') id: string, @Param('damageId') damageId: string, @Req() request: Request): Claim | Promise<Claim> | Observable<Claim> {
    return this.damagesApi.deleteDamage(id, damageId, request);
  }

  @Patch('/claims/:id/damages/:damageId')
  updateDamage(@Param('id') id: string, @Param('damageId') damageId: string, @Body() updateDamageRequest: UpdateDamageRequest, @Req() request: Request): Claim | Promise<Claim> | Observable<Claim> {
    return this.damagesApi.updateDamage(id, damageId, updateDamageRequest, request);
  }

} 