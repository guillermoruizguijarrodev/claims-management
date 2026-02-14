import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { Claim, ClaimSchema, ClaimDocument } from './schemas/claim.schema';
import { DamageSeverity, ClaimStatus } from '../core/generated/models'; 

describe('Claim Integration (DB Calculation)', () => {
  let mongoServer: MongoMemoryServer;
  let module: TestingModule;
  let claimModel: Model<ClaimDocument>;

  // 1. Before everything: Start Mongo in memory
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri), // Connect to the in-memory DB
        MongooseModule.forFeature([{ name: Claim.name, schema: ClaimSchema }]),
      ],
    }).compile();

    claimModel = module.get<Model<ClaimDocument>>(getModelToken(Claim.name));
  });

  // 2. After everything: Close the connection and stop Mongo
  afterAll(async () => {
    await module.close();
    await mongoServer.stop();
  });

  // 3. Clean the collection after each test
  afterEach(async () => {
    await claimModel.deleteMany({});
  });

  it('should automatically calculate totalAmount when saving damages', async () => {
    // A. PREPARE: Create a claim
    const claim = new claimModel({
      title: 'Accident Integration Test',
      description: 'Automatic calculation test',
      status: ClaimStatus.Pending,
      damages: [], // Start empty
    });

    // B. ACT: Add damages and save
    // Damage 1: 100€
    claim.damages.push({
      part: 'Bumper',
      severity: DamageSeverity.Low,
      imageUrl: 'http://img.com',
      price: 100,
    } as any);

    // Damage 2: 250.50€
    claim.damages.push({
      part: 'Windshield',
      severity: DamageSeverity.High,
      imageUrl: 'http://img.com',
      price: 250.50,
    } as any);

    // Save to the "Database" (this triggers the pre-save hook)
    await claim.save();

    // C. VERIFY: Retrieve the fresh document from the DB
    const savedClaim = await claimModel.findById(claim._id).exec();

    // Verify that Mongoose executed your logic
    expect(savedClaim).toBeDefined();
    expect((savedClaim as Claim).damages).toHaveLength(2);
    
    // 100 + 250.50 = 350.50
    expect((savedClaim as Claim).totalAmount).toBe(350.50); 
  });
});