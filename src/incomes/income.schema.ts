import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type IncomeDocument = Income & Document;

@Schema({ timestamps: true })
export class Income {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ default: false })
  isRecurring: boolean;

  @Prop({ trim: true, default: '' })
  notes: string;
}

export const IncomeSchema = SchemaFactory.createForClass(Income);
IncomeSchema.index({ userId: 1, date: -1 });
