import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExpenseDocument = Expense & Document;

export enum ExpenseMode {
  MANUAL = 'manual',
  AUTO = 'auto',
  TEMPLATE = 'template',
}

@Schema({ timestamps: true })
export class Expense {
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

  @Prop({ enum: ExpenseMode, default: ExpenseMode.MANUAL })
  mode: ExpenseMode;

  @Prop({ type: Types.ObjectId, ref: 'Recurring', default: null })
  recurringId: Types.ObjectId | null;

  @Prop({ default: false })
  isRecurring: boolean;

  @Prop({ trim: true, default: '' })
  notes: string;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
ExpenseSchema.index({ userId: 1, date: -1 });
