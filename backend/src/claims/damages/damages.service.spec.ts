import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DamagesService } from './damages.service'; // Ensure the correct path
import { Claim } from '../schemas/claim.schema';
import { ClaimStatus, UpdateDamageRequest } from '../../core/generated/models';

describe('DamagesService', () => {
  let service: DamagesService;
  
  // Base object to simulate a damage
  const mockDamage = {
    _id: 'damage123',
    part: 'Bumper',
    deleteOne: jest.fn(), // Important for deleteDamage
  };

  // Base object to simulate a Claim
  const mockClaimDocument = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Claim',
    status: ClaimStatus.Pending as ClaimStatus,
    description: 'A description',
    // TRICK: Object.assign creates an array and attaches extra properties at once
    damages: Object.assign([], { id: jest.fn() }), 
    save: jest.fn().mockResolvedValue(true),
  };

  // Simulate the .id() method that Mongoose provides for subdocument arrays
  mockClaimDocument.damages.id = jest.fn(); 

  const mockClaimModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DamagesService,
        {
          provide: getModelToken(Claim.name),
          useValue: mockClaimModel,
        },
      ],
    }).compile();

    service = module.get<DamagesService>(DamagesService);
    
    // General reset
    jest.clearAllMocks();
    mockClaimDocument.damages = [] as any; // Clear the array
    // Restore the .id function
    mockClaimDocument.damages.id = jest.fn();
    mockClaimDocument.save.mockClear();
    mockDamage.deleteOne.mockClear();
  });

  // Helper to simulate findById finding (or not finding) a document
  const mockFindById = (doc: any) => {
    mockClaimModel.findById.mockReturnValue({
      // Mongoose findById returns a Query, we need to chain .exec() or await
      // Since your service uses await this.claimModel.findById(id), sometimes without direct exec()
      // but in the code you provided earlier: "await this.claimModel.findById(id)" -> returns thenable
      then: (resolve: any) => resolve(doc) 
    });
  };

  describe('addDamage', () => {
    it('should add damage successfully to pending claim', async () => {
      mockClaimDocument.status = ClaimStatus.Pending;
      mockFindById(mockClaimDocument);

      const damageDto = { part: 'Door', severity: 'LOW', price: 100 } as any;
      
      await service.addDamage('507f1f77bcf86cd799439011', damageDto);

      expect(mockClaimDocument.damages).toContainEqual(damageDto);
      expect(mockClaimDocument.save).toHaveBeenCalled();
    });

    it('should throw BadRequest if claim is NOT pending', async () => {
      mockClaimDocument.status = ClaimStatus.Finished;
      mockFindById(mockClaimDocument);

      await expect(
        service.addDamage('507f1f77bcf86cd799439011', {} as any)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if ID format is invalid', async () => {
        await expect(service.addDamage('bad-id', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteDamage', () => {
    it('should delete damage successfully', async () => {
        mockClaimDocument.status = ClaimStatus.Pending;
        mockFindById(mockClaimDocument);
        
        // Configure the mock so that .id() returns our fake damage
        (mockClaimDocument.damages.id as jest.Mock).mockReturnValue(mockDamage);

        await service.deleteDamage('507f1f77bcf86cd799439011', 'damage123');

        expect(mockClaimDocument.damages.id).toHaveBeenCalledWith('damage123');
        expect(mockDamage.deleteOne).toHaveBeenCalled();
        expect(mockClaimDocument.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if damage subdocument not found', async () => {
        mockClaimDocument.status = ClaimStatus.Pending;
        mockFindById(mockClaimDocument);
        
        // .id() returns null
        (mockClaimDocument.damages.id as jest.Mock).mockReturnValue(null);

        await expect(
            service.deleteDamage('507f1f77bcf86cd799439011', 'missing-damage')
        ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateDamage', () => {
    it('should update ALL damage fields successfully', async () => {
      mockClaimDocument.status = ClaimStatus.Pending;
      mockFindById(mockClaimDocument);
  
      const existingDamage = { 
          part: 'Old Part', 
          price: 50,
          severity: 'LOW',
          imageUrl: 'old.jpg'
      };
      (mockClaimDocument.damages.id as jest.Mock).mockReturnValue(existingDamage);
  
      // Send ALL fields to trigger all IFs in the service
      await service.updateDamage('507f1f77bcf86cd799439011', 'damage123', {
          part: 'New Part',
          price: 200,
          severity: 'HIGH' as any,   // Force entry into the severity IF
          imageUrl: 'http://new-image.com' // Force entry into the imageUrl IF
      } as any);
  
      expect(existingDamage.part).toBe('New Part');
      expect(existingDamage.price).toBe(200);
      expect(existingDamage.severity).toBe('HIGH');
      expect(existingDamage.imageUrl).toBe('http://new-image.com');
      expect(mockClaimDocument.save).toHaveBeenCalled();
    });

    it('should throw BadRequest if trying to update damage on FINISHED claim', async () => {
        mockClaimDocument.status = ClaimStatus.Finished;
        mockFindById(mockClaimDocument);

        await expect(
            service.updateDamage('507f1f77bcf86cd799439011', 'd1', {} as unknown as UpdateDamageRequest)
        ).rejects.toThrow(BadRequestException);
    });
  });
});