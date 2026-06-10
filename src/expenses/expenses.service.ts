import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense, ExpenseDocument } from './expense.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(@InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>) {}

  async create(userId: string, dto: CreateExpenseDto): Promise<ExpenseDocument> {
    const expense = new this.expenseModel({
      ...dto,
      userId: new Types.ObjectId(userId),
      categoryId: new Types.ObjectId(dto.categoryId),
      recurringId: dto.recurringId ? new Types.ObjectId(dto.recurringId) : null,
      date: new Date(dto.date),
    });
    return expense.save();
  }

  async findByMonth(userId: string, year: number, month: number): Promise<ExpenseDocument[]> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return this.expenseModel
      .find({ userId, date: { $gte: start, $lt: end } })
      .populate('categoryId', 'name icon color')
      .sort({ date: -1 })
      .exec();
  }

  async findAll(userId: string): Promise<ExpenseDocument[]> {
    return this.expenseModel
      .find({ userId })
      .populate('categoryId', 'name icon color')
      .sort({ date: -1 })
      .exec();
  }

  async findOne(userId: string, id: string): Promise<ExpenseDocument> {
    const expense = await this.expenseModel
      .findOne({ _id: id, userId })
      .populate('categoryId', 'name icon color')
      .exec();
    if (!expense) throw new NotFoundException('Gasto no encontrado');
    return expense;
  }

  async update(userId: string, id: string, dto: Partial<CreateExpenseDto>): Promise<ExpenseDocument> {
    const update: Record<string, unknown> = { ...dto };
    if (dto.categoryId) update.categoryId = new Types.ObjectId(dto.categoryId);
    if (dto.date) update.date = new Date(dto.date);

    const expense = await this.expenseModel
      .findOneAndUpdate({ _id: id, userId }, update, { new: true })
      .populate('categoryId', 'name icon color')
      .exec();
    if (!expense) throw new NotFoundException('Gasto no encontrado');
    return expense;
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.expenseModel.deleteOne({ _id: id, userId }).exec();
    if (result.deletedCount === 0) throw new NotFoundException('Gasto no encontrado');
  }

  async getTotalByMonth(userId: string, year: number, month: number): Promise<number> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    const result = await this.expenseModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId), date: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  async getMonthlyTotals(userId: string, year: number): Promise<{ month: number; total: number }[]> {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    const result = await this.expenseModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId), date: { $gte: start, $lt: end } } },
      { $group: { _id: { month: { $month: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.month': 1 } },
    ]);
    return result.map(r => ({ month: r._id.month, total: r.total }));
  }

  async getByCategoryForMonth(userId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return this.expenseModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId), date: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: '$categoryId',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      { $sort: { total: -1 } },
    ]);
  }
}
