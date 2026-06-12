import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BillItemDocument = BillItem & Document;

export enum BillStatus {
  PENDING = 'pending',
  PAID = 'paid',
}

@Schema({ timestamps: true })
export class BillItem {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  categoryId?: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 31 })
  dueDay: number;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true, min: 1, max: 12 })
  month: number;

  @Prop({ enum: BillStatus, default: BillStatus.PENDING })
  status: BillStatus;

  @Prop()
  paidAt?: Date;

  @Prop({ default: false })
  isRecurring: boolean;

  @Prop({ default: '' })
  notes: string;
}

export const BillItemSchema = SchemaFactory.createForClass(BillItem);
