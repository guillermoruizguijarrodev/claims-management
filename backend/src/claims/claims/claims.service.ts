import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClaimsApi } from '../../core/generated/api/ClaimsApi';
import { 
    Claim as ClaimInterface,
    CreateClaimDto, 
    UpdateClaimRequest,
    ClaimStatus,
    DamageSeverity
} from '../../core/generated/models';
import { ClaimValidationStrategy, HighSeverityDescriptionStrategy } from '../strategies/claim-validation.strategy';

import { Claim, ClaimDocument } from '../schemas/claim.schema';

@Injectable()
export class ClaimsService implements ClaimsApi {

    //Desing pattern: Strategy.
    private finishClaimStrategies: ClaimValidationStrategy[] = [
        new HighSeverityDescriptionStrategy()
    ];

    constructor(
        @InjectModel(Claim.name) private readonly claimModel: Model<ClaimDocument>
    ) {}
    
    /**
     * POST /claims. Creates a new claim in the database. The claim starts with status "Pending" and totalAmount 0.
     * @param createClaimDto 
     * @param _request 
     * @returns 
     */
    async createClaim(
        createClaimDto: CreateClaimDto, 
        _request?: unknown
    ): Promise<ClaimInterface> {
        // Let Mongoose handle the creation of subdocuments automatically
        const createdClaim = new this.claimModel({
            ...createClaimDto,
            damages: createClaimDto.damages || [] // Pass the damages array directly
        });

        // Save the claim to the database
        const saved = await createdClaim.save();

        return saved as unknown as ClaimInterface;
    }

    /**
     * GET /claims/:id. Retrieves a claim by its ID. If the claim does not exist, throws a 404 Not Found exception.
     * @param id 
     * @param _request 
     * @returns 
     */
    async getClaimById(
        id: string, 
        _request?: any
    ): Promise<ClaimInterface> {
        // Validating that the ID is a valid MongoDB ObjectId format (24 hex characters)
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new NotFoundException('Invalid ID format');
        }

        const claim = await this.claimModel.findById(id).exec();
        if (!claim) {
            throw new NotFoundException(`Claim with ID ${id} not found`);
        }

        return claim as unknown as ClaimInterface;
    }

    /**
     * GET /claims. Retrieves all claims from the database. Returns an empty array if no claims exist.
     * @param id 
     * @param _request 
     * @returns 
     */
    async getClaims(_request?: any): Promise<Array<ClaimInterface>> {
        return this.claimModel.find().exec() as unknown as Array<ClaimInterface>;
    }

    /**
     * PATCH /claims/:id. Updates any field of a claim. Validates business rules for updates.
     * @param id 
     * @param updateClaimRequest 
     * @param _request 
     * @returns 
     */
    async updateClaim(
        id: string, 
        updateClaimRequest: UpdateClaimRequest, 
        _request?: any
    ): Promise<ClaimInterface> {
        // Retrieve the claim from the database
        const claim = await this.claimModel.findById(id).exec();
        if (!claim) throw new NotFoundException(`Claim with ID ${id} not found`);

        // Business Rule: Finished claims cannot be modified
        if (claim.status === ClaimStatus.Finished) {
            throw new BadRequestException('Cannot modify a finished claim');
        }

        // Business Rule: If the new status is "Finished", validate the rules for finishing a claim
        if (updateClaimRequest.status === ClaimStatus.Finished) {
            // Iterates all configured rules
            this.executeFinishStrategies(claim); 
        }

        // Update the fields of the claim if provided in the request
        if (updateClaimRequest.title !== undefined) claim.title = updateClaimRequest.title;    
        if (updateClaimRequest.description !== undefined) claim.description = updateClaimRequest.description;        
        if (updateClaimRequest.status !== undefined) claim.status = updateClaimRequest.status;        
        if (updateClaimRequest.totalAmount !== undefined) claim.totalAmount = updateClaimRequest.totalAmount;
        

        // Save the updated claim to the database
        const saved = await claim.save();

        return saved as unknown as ClaimInterface;
    }

    /**
     * Helper method to execute validation strategies
     */
    private executeFinishStrategies(claim: ClaimDocument): void {
        for (const strategy of this.finishClaimStrategies) {
            strategy.validate(claim);
        }
    }
}