import { Type } from '@nestjs/common';
import { ClaimsApi } from './api';
import { DamagesApi } from './api';

/**
 * Provide this type to {@link ApiModule} to provide your API implementations
**/
export type ApiImplementations = {
  claimsApi: Type<ClaimsApi>
  damagesApi: Type<DamagesApi>
};
