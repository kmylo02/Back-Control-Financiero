import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
import { Recurring, RecurringDocument, RecurringMode, RecurringType } from './recurring.schema';
import { Expense, ExpenseDocument } from '../expenses/expense.schema';
import { Income, IncomeDocument } from '../incomes/income.schema';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { ExpenseMode } from '../expenses/expense.schema';

@Injectable()
export class RecurringService {
  constructor(
    @InjectModel(Recurring.name) private recurringModel: Model<RecurringDocument>,
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(Income.name) private incomeModel: Model<IncomeDocument>,
  ) {}

  async create(userId: string, dto: CreateRecurringDto): Promise<RecurringDocument> {
    const recurring = new this.recurringModel({
      ...dto,
      userId: new Types.ObjectId(userId),
      categoryId: new Types.ObjectId(dto.categoryId),
    });
    return recurring.save();
  }

  async findAll(userId: string): Promise<RecurringDocument[]> {
    return this.recurringModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('categoryId', 'name icon color')
      .sort({ name: 1 })
      .exec();
  }

  async findOne(userId: string, id: string): Promise<RecurringDocument> {
    const rec = await this.recurringModel
      .findOne({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) })
      .populate('categoryId', 'name icon color')
      .exec();
    if (!rec) throw new NotFoundException('Recurrente no encontrado');
    return rec;
  }

  async update(userId: string, id: string, dto: Partial<CreateRecurringDto>): Promise<RecurringDocument> {
    const update: Record<string, unknown> = { ...dto };
    if (dto.categoryId) update.categoryId = new Types.ObjectId(dto.categoryId);

    const rec = await this.recurringModel
      .findOneAndUpdate({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) }, update, { new: true })
      .populate('categoryId', 'name icon color')
      .exec();
    if (!rec) throw new NotFoundException('Recurrente no encontrado');
    return rec;
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.recurringModel.deleteOne({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) }).exec();
    if (result.deletedCount === 0) throw new NotFoundException('Recurrente no encontrado');
  }

  // Activa un recurrente manual o de plantilla para el mes actual
  async activate(userId: string, id: string, amount?: number): Promise<ExpenseDocument | IncomeDocument> {
    const rec = await this.recurringModel.findOne({ _id: id, userId }).exec();
    if (!rec) throw new NotFoundException('Recurrente no encontrado');

    const finalAmount = amount ?? rec.amount;
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), rec.dayOfMonth);

    if (rec.type === RecurringType.EXPENSE) {
      const expense = new this.expenseModel({
        userId: rec.userId,
        amount: finalAmount,
        description: rec.name,
        date,
        categoryId: rec.categoryId,
        mode: rec.mode === RecurringMode.AUTO ? ExpenseMode.AUTO : ExpenseMode.TEMPLATE,
        recurringId: rec._id,
        isRecurring: true,
        notes: rec.notes,
      });
      await this.recurringModel.findByIdAndUpdate(id, { lastGeneratedAt: now });
      return expense.save();
    } else {
      const income = new this.incomeModel({
        userId: rec.userId,
        amount: finalAmount,
        description: rec.name,
        date,
        categoryId: rec.categoryId,
        isRecurring: true,
        notes: rec.notes,
      });
      await this.recurringModel.findByIdAndUpdate(id, { lastGeneratedAt: now });
      return income.save();
    }
  }

  // Cron: cada día 1 del mes a las 6am genera automáticamente los recurrentes AUTO
  @Cron('0 6 1 * *')
  async generateAutoRecurring(): Promise<void> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const autoRecurrents = await this.recurringModel
      .find({ mode: RecurringMode.AUTO, isActive: true })
      .exec();

    for (const rec of autoRecurrents) {
      const alreadyGenerated =
        rec.lastGeneratedAt &&
        rec.lastGeneratedAt.getFullYear() === year &&
        rec.lastGeneratedAt.getMonth() === month;

      if (alreadyGenerated) continue;

      const date = new Date(year, month, rec.dayOfMonth);

      if (rec.type === RecurringType.EXPENSE) {
        await this.expenseModel.create({
          userId: rec.userId,
          amount: rec.amount,
          description: rec.name,
          date,
          categoryId: rec.categoryId,
          mode: ExpenseMode.AUTO,
          recurringId: rec._id,
          isRecurring: true,
          notes: rec.notes,
        });
      } else {
        await this.incomeModel.create({
          userId: rec.userId,
          amount: rec.amount,
          description: rec.name,
          date,
          categoryId: rec.categoryId,
          isRecurring: true,
          notes: rec.notes,
        });
      }

      await this.recurringModel.findByIdAndUpdate(rec._id, { lastGeneratedAt: now });
    }
  }

  // Retorna los recurrentes manuales/plantilla pendientes de activar este mes
  async getPendingForCurrentMonth(userId: string): Promise<RecurringDocument[]> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    return this.recurringModel
      .find({
        userId: new Types.ObjectId(userId),
        isActive: true,
        mode: { $in: [RecurringMode.MANUAL, RecurringMode.TEMPLATE] },
        $or: [
          { lastGeneratedAt: null },
          {
            lastGeneratedAt: {
              $lt: new Date(year, month, 1),
            },
          },
        ],
      })
      .populate('categoryId', 'name icon color')
      .exec();
  }
}
