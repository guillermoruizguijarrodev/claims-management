// src/claims/strategies/claim-validation.strategy.ts

import { ClaimDocument } from '../schemas/claim.schema';
import { DamageSeverity } from '../../core/generated/models';
import { BadRequestException } from '@nestjs/common';

// 1. The Interface (The contract)
export interface ClaimValidationStrategy {
    validate(claim: ClaimDocument): void;
}

// 2. The Concrete Strategy (Your current business rule)
export class HighSeverityDescriptionStrategy implements ClaimValidationStrategy {
    validate(claim: ClaimDocument): void {
        const hasHighSeverity = claim.damages.some(d => d.severity === DamageSeverity.High);

        if (hasHighSeverity) {
            if (!claim.description || claim.description.length <= 100) {
                throw new BadRequestException(
                    'Claims with HIGH severity damages require a description exceeding 100 characters to be Finished.'
                );
            }
        }
    }
}