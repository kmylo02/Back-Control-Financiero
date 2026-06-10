import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

export enum CategoryType {
  EXPENSE = 'expense',
  INCOME = 'income',
  BOTH = 'both',
}

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: CategoryType, default: CategoryType.EXPENSE })
  type: CategoryType;

  @Prop({ default: 'receipt' })
  icon: string;

  @Prop({ default: '#6366f1' })
  color: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ default: false })
  isDefault: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
