import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BudgetDocument = Budget & Document;

export class CategoryLimit {
  categoryId: Types.ObjectId;
  limit: number;
}

@Schema({ timestamps: true })
export class Budget {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true, min: 1, max: 12 })
  month: number;

  @Prop({ required: true })
  totalLimit: number;

  @Prop({
    type: [{ categoryId: { type: Types.ObjectId, ref: 'Category' }, limit: Number }],
    default: [],
  })
  categoryLimits: CategoryLimit[];
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);
BudgetSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });
