import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DamagesApi } from '../../core/generated/api/DamagesApi';
import { 
    Claim as ClaimInterface,
    CreateDamageDto, 
    UpdateDamageRequest,
    ClaimStatus
} from '../../core/generated/models';

import { Claim, ClaimDocument, DamageDocument } from '../schemas/claim.schema';

@Injectable()
export class DamagesService implements DamagesApi {
    constructor(
        @InjectModel(Claim.name) private readonly claimModel: Model<ClaimDocument>
    ) {}

    /**
     * POST /claims/:id/damages. Adds a new damage to a claim.
     * Business Rule: Can only add damages if the claim is in "Pending" status.
     * @param id Claim ID
     * @param createDamageDto Data for the new damage
     * @param _request 
     */
    async addDamage(
        id: string, 
        createDamageDto: CreateDamageDto, 
        _request?: any
    ): Promise<ClaimInterface> {
        // 1. Find the claim
        const claim = await this.findClaimOrThrow(id);

        // 2. Validate business rule: Only editable if status is PENDING
        this.validateClaimIsEditable(claim);

        // 3. Add the damage to the array (Mongoose automatically converts it into a subdocument)
        // Mongoose will automatically generate the _id for the damage
        claim.damages.push(createDamageDto as any);

        // 4. Save (This will trigger the pre('save') hook to recalculate the totalAmount)
        const savedClaim = await claim.save();

        return savedClaim as unknown as ClaimInterface;
    }

    /**
     * DELETE /claims/:id/damages/:damageId. Removes a damage from a claim.
     * Business Rule: Can only delete damages if the claim is in "Pending" status.
     * @param id Claim ID
     * @param damageId Damage ID
     * @param _request 
     */
    async deleteDamage(
        id: string, 
        damageId: string, 
        _request?: any
    ): Promise<ClaimInterface> {
        const claim = await this.findClaimOrThrow(id);
        this.validateClaimIsEditable(claim);

        // 1. Find the subdocument
        const damage = claim.damages.id(damageId);
        
        if (!damage) {
            throw new NotFoundException(`Damage with ID ${damageId} not found in claim ${id}`);
        }

        // 2. Delete using the .deleteOne() method of the Mongoose subdocument
        damage.deleteOne();

        // 3. Save changes and recalculate total
        const savedClaim = await claim.save();

        return savedClaim as unknown as ClaimInterface;
    }

    /**
     * PATCH /claims/:id/damages/:damageId. Updates an existing damage.
     * Business Rule: Can only update damages if the claim is in "Pending" status.
     * @param id Claim ID
     * @param damageId Damage ID
     * @param updateDamageRequest Fields to update
     * @param _request 
     */
    async updateDamage(
        id: string, 
        damageId: string, 
        updateDamageRequest: UpdateDamageRequest, 
        _request?: any
    ): Promise<ClaimInterface> {
        const claim = await this.findClaimOrThrow(id);
        this.validateClaimIsEditable(claim);

        // 1. Find the specific subdocument
        const damage = claim.damages.id(damageId);

        if (!damage) {
            throw new NotFoundException(`Damage with ID ${damageId} not found`);
        }

        // 2. Update fields individually if provided in the request
        if (updateDamageRequest.part !== undefined) damage.part = updateDamageRequest.part;
        if (updateDamageRequest.severity !== undefined) damage.severity = updateDamageRequest.severity as any;
        if (updateDamageRequest.price !== undefined) damage.price = updateDamageRequest.price;
        if (updateDamageRequest.imageUrl !== undefined) damage.imageUrl = updateDamageRequest.imageUrl;

        // 3. Save (the hook will recalculate the totalAmount based on the new price)
        const savedClaim = await claim.save();

        return savedClaim as unknown as ClaimInterface;
    }

    // --- Private Helper Methods ---

    /**
     * Helper to find a claim and handle 404 error standardly
     */
    private async findClaimOrThrow(id: string): Promise<ClaimDocument> {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new NotFoundException('Invalid Claim ID format');
        }
        const claim = await this.claimModel.findById(id);
        if (!claim) {
            throw new NotFoundException(`Claim with ID ${id} not found`);
        }
        return claim;
    }

    /**
     * Helper to enforce the "Only Pending claims are editable" rule
     */
    private validateClaimIsEditable(claim: ClaimDocument): void {
        if (claim.status !== ClaimStatus.Pending) {
            throw new BadRequestException(
                `Damages can only be managed when claim status is PENDING. Current status: ${claim.status}`
            );
        }
    }
}