import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { Claim } from '../schemas/claim.schema';
import { ClaimStatus, DamageSeverity } from '../../core/generated/models';

describe('ClaimsService', () => {
  let service: ClaimsService;
  let model: any;

  // Mock of a Mongoose Document (an instance of Claim)
  const mockClaimDocument = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Claim',
    status: ClaimStatus.Pending,
    damages: [],
    description: 'A description',
    save: jest.fn().mockResolvedValue(true), // Simulates saving
  };

  // Mock of the Mongoose Model
  const mockClaimModel = {
    // For new this.claimModel(...)
    constructor: jest.fn().mockImplementation(() => mockClaimDocument),
    // Static methods
    find: jest.fn(),
    findById: jest.fn(),
  };

  // Make the mock invocable as a constructor (new Model)
  class MockModel {
    constructor(dto: any) {
      return mockClaimDocument;
    }
    static find = jest.fn();
    static findById = jest.fn();
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaimsService,
        {
          provide: getModelToken(Claim.name),
          useValue: MockModel, // Use the Mock class to allow 'new'
        },
      ],
    }).compile();

    service = module.get<ClaimsService>(ClaimsService);
    model = module.get(getModelToken(Claim.name));
    
    // Reset mocks before each test
    jest.clearAllMocks();
    mockClaimDocument.save.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createClaim', () => {
    it('should create and save a new claim', async () => {
      const createDto = { title: 'New Claim', description: 'Desc' };
      const result = await service.createClaim(createDto as any);

      expect(result).toBeDefined();
      expect(mockClaimDocument.save).toHaveBeenCalled();
    });
  });

  describe('getClaimById', () => {
    it('should return a claim if found', async () => {
      // Simulate chaining .exec()
      MockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockClaimDocument),
      });

      const result = await service.getClaimById('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockClaimDocument);
    });

    it('should throw NotFoundException if ID format is invalid', async () => {
      await expect(service.getClaimById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if claim not found in DB', async () => {
      MockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getClaimById('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getClaims', () => {
    it('should return an array of claims', async () => {
      MockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockClaimDocument]),
      });

      const result = await service.getClaims();
      expect(result).toHaveLength(1);
    });
  });

  describe('updateClaim', () => {
    it('should throw NotFoundException if claim does not exist', async () => {
      MockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateClaim('507f1f77bcf86cd799439011', {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if trying to modify a FINISHED claim', async () => {
      const finishedClaim = { ...mockClaimDocument, status: ClaimStatus.Finished };
      MockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(finishedClaim),
      });

      await expect(
        service.updateClaim('507f1f77bcf86cd799439011', { title: 'New' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update fields successfully for PENDING claim', async () => {
      MockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockClaimDocument),
      });

      await service.updateClaim('507f1f77bcf86cd799439011', {
        title: 'Updated Title',
        totalAmount: 100,
      });

      expect(mockClaimDocument.title).toBe('Updated Title');
      expect(mockClaimDocument.save).toHaveBeenCalled();
    });

    // --- BUSINESS RULE TESTS (validateFinishRules) ---

    it('should throw BadRequest when finishing a claim with HIGH severity but short description', async () => {
      const highSeverityClaim = {
        ...mockClaimDocument,
        status: ClaimStatus.Pending,
        description: 'Short desc', // < 100 chars
        damages: [{ severity: DamageSeverity.High }],
        save: jest.fn(),
      };
    
      MockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(highSeverityClaim),
      });
    
      await expect(
        service.updateClaim('507f1f77bcf86cd799439011', {
          status: ClaimStatus.Finished,
        }),
      ).rejects.toThrow(BadRequestException); 
    });

    it('should ALLOW finishing a claim with HIGH severity and LONG description', async () => {
      const longDesc = 'a'.repeat(101); // 101 chars
      const highSeverityClaim = {
        ...mockClaimDocument,
        status: ClaimStatus.Pending,
        description: longDesc,
        damages: [{ severity: DamageSeverity.High }],
        save: jest.fn().mockResolvedValue(true),
      };

      MockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(highSeverityClaim),
      });

      const result = await service.updateClaim('507f1f77bcf86cd799439011', {
        status: ClaimStatus.Finished,
      });

      expect(highSeverityClaim.status).toBe(ClaimStatus.Finished);
      expect(highSeverityClaim.save).toHaveBeenCalled();
    });

    it('should ALLOW finishing a claim with LOW severity damages regardless of description length', async () => {
      const lowSeverityClaim = {
        ...mockClaimDocument,
        status: ClaimStatus.Pending,
        description: 'Short',
        damages: [{ severity: DamageSeverity.Low }],
        save: jest.fn().mockResolvedValue(true),
      };
    
      MockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(lowSeverityClaim),
      });
    
      const result = await service.updateClaim('507f1f77bcf86cd799439011', {
        status: ClaimStatus.Finished,
      });
    
      expect(lowSeverityClaim.status).toBe(ClaimStatus.Finished);
      expect(lowSeverityClaim.save).toHaveBeenCalled();
    });
  });
});