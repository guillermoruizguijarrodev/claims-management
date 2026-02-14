import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ClaimsService } from './claims/claims.service';
import { DamagesService } from './damages/damages.service';

import { Claim, ClaimSchema } from './schemas/claim.schema';
import { ClaimsApiController } from '../core/generated/controllers/ClaimsApi.controller';
import { ClaimsApi } from '../core/generated/api/ClaimsApi';

import { DamagesApiController } from '../core/generated/controllers/DamagesApi.controller';
import { DamagesApi } from '../core/generated/api/DamagesApi';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Claim.name, schema: ClaimSchema }]),
  ],
  controllers: [
    ClaimsApiController,
    DamagesApiController
  ],
  providers: [
    {
      provide: ClaimsApi,
      useClass: ClaimsService
    },
    {
      provide: DamagesApi,
      useClass: DamagesService
    }
    
  ],
  exports: [
    {
    provide: ClaimsApi,
    useClass: ClaimsService
    },
    {
      provide: DamagesApi,
      useClass: DamagesService
    }
  ]
})

export class ClaimsModule {}
