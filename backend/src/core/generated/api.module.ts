import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ApiImplementations } from './api-implementations'
import { ClaimsApi } from './api';
import { ClaimsApiController } from './controllers';
import { DamagesApi } from './api';
import { DamagesApiController } from './controllers';

@Module({})
export class ApiModule {
  static forRoot(apiImplementations: ApiImplementations): DynamicModule {
      const providers: Provider[] = [
        {
          provide: ClaimsApi,
          useClass: apiImplementations.claimsApi
        },
        {
          provide: DamagesApi,
          useClass: apiImplementations.damagesApi
        },
      ];

      return {
        module: ApiModule,
        controllers: [
          ClaimsApiController,
          DamagesApiController,
        ],
        providers: [...providers],
        exports: [...providers]
      }
    }
}