import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { ClaimStatus, DamageSeverity } from '../../core/generated/models';

export type ClaimDocument = HydratedDocument<Claim>;
export type DamageDocument = HydratedDocument<Damage>;

export const transformClaim = (doc: any, ret: any) : void => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
};

const toJSONSettings = {
  virtuals: true,
  versionKey: false,
  transform: transformClaim
};

/**
 * Damage schema
 * Represents a single damage item. It is contained within a Claim.
 */
@Schema({
    toJSON: toJSONSettings
})
export class Damage {

    @Prop({ required: true })
    part: string;

    @Prop({ type: String, required: true, enum: DamageSeverity })
    severity: DamageSeverity;

    @Prop({ required: true })
    imageUrl: string;

    @Prop({ required: true, min: 0 })
    price: number;
}

const DamageSchema = SchemaFactory.createForClass(Damage);

/**
 * Claim schema
 * Represents a claim made by a user. Contains details about the claim and an array of damages.
 */
@Schema({
    toJSON: toJSONSettings,
    timestamps: true,
    versionKey: false
})
export class Claim {

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, required: true, enum: ClaimStatus, default: ClaimStatus.Pending })
  status: ClaimStatus;

  @Prop({ default: 0 })
  totalAmount: number;

  @Prop({ type: [DamageSchema], default: [] })
  damages: Types.DocumentArray<DamageDocument>;
}

export const ClaimSchema = SchemaFactory.createForClass(Claim);

export const calculateTotalAmount = function (next: Function) : void {
  if (this.isModified('damages')) {
    this.totalAmount = this.damages.reduce((sum: number, current: Damage) => sum + current.price, 0);
  }

  if (next && typeof next === 'function') {
    next();
  }
};

/**
 * Pre-save hook to calculate the total amount of the claim based on the damages.
 */
ClaimSchema.pre('save', calculateTotalAmount);