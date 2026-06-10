import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RecurringDocument = Recurring & Document;

export enum RecurringMode {
  AUTO = 'auto',
  MANUAL = 'manual',
  TEMPLATE = 'template',
}

export enum RecurringType {
  EXPENSE = 'expense',
  INCOME = 'income',
}

@Schema({ timestamps: true })
export class Recurring {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ enum: RecurringMode, default: RecurringMode.MANUAL })
  mode: RecurringMode;

  @Prop({ enum: RecurringType, default: RecurringType.EXPENSE })
  type: RecurringType;

  @Prop({ default: 1, min: 1, max: 28 })
  dayOfMonth: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date, default: null })
  lastGeneratedAt: Date | null;

  @Prop({ trim: true, default: '' })
  notes: string;
}

export const RecurringSchema = SchemaFactory.createForClass(Recurring);
