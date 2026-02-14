import { Body, Controller, Get, Patch, Post, Param, Query, Req } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClaimsApi } from '../api';
import type { Claim, CreateClaimDto, UpdateClaimRequest,  } from '../models';

@Controller()
export class ClaimsApiController {
  constructor(private readonly claimsApi: ClaimsApi) {}

  @Post('/claims')
  createClaim(@Body() createClaimDto: CreateClaimDto, @Req() request: Request): Claim | Promise<Claim> | Observable<Claim> {
    return this.claimsApi.createClaim(createClaimDto, request);
  }

  @Get('/claims/:id')
  getClaimById(@Param('id') id: string, @Req() request: Request): Claim | Promise<Claim> | Observable<Claim> {
    return this.claimsApi.getClaimById(id, request);
  }

  @Get('/claims')
  getClaims(@Req() request: Request): Array<Claim> | Promise<Array<Claim>> | Observable<Array<Claim>> {
    return this.claimsApi.getClaims(request);
  }

  @Patch('/claims/:id')
  updateClaim(@Param('id') id: string, @Body() updateClaimRequest: UpdateClaimRequest, @Req() request: Request): Claim | Promise<Claim> | Observable<Claim> {
    return this.claimsApi.updateClaim(id, updateClaimRequest, request);
  }

} 