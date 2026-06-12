import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Income, IncomeDocument } from './income.schema';
import { CreateIncomeDto } from './dto/create-income.dto';

@Injectable()
export class IncomesService {
  constructor(@InjectModel(Income.name) private incomeModel: Model<IncomeDocument>) {}

  async create(userId: string, dto: CreateIncomeDto): Promise<IncomeDocument> {
    const income = new this.incomeModel({
      ...dto,
      userId: new Types.ObjectId(userId),
      categoryId: new Types.ObjectId(dto.categoryId),
      date: new Date(dto.date),
    });
    return income.save();
  }

  async findByMonth(userId: string, year: number, month: number): Promise<IncomeDocument[]> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return this.incomeModel
      .find({ userId: new Types.ObjectId(userId), date: { $gte: start, $lt: end } })
      .populate('categoryId', 'name icon color')
      .sort({ date: -1 })
      .exec();
  }

  async findAll(userId: string): Promise<IncomeDocument[]> {
    return this.incomeModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('categoryId', 'name icon color')
      .sort({ date: -1 })
      .exec();
  }

  async update(userId: string, id: string, dto: Partial<CreateIncomeDto>): Promise<IncomeDocument> {
    const update: Record<string, unknown> = { ...dto };
    if (dto.categoryId) update.categoryId = new Types.ObjectId(dto.categoryId);
    if (dto.date) update.date = new Date(dto.date);

    const income = await this.incomeModel
      .findOneAndUpdate({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) }, update, { new: true })
      .populate('categoryId', 'name icon color')
      .exec();
    if (!income) throw new NotFoundException('Ingreso no encontrado');
    return income;
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.incomeModel.deleteOne({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) }).exec();
    if (result.deletedCount === 0) throw new NotFoundException('Ingreso no encontrado');
  }

  async getTotalByMonth(userId: string, year: number, month: number): Promise<number> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    const result = await this.incomeModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId), date: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  async getMonthlyTotals(userId: string, year: number): Promise<{ month: number; total: number }[]> {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    const result = await this.incomeModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId), date: { $gte: start, $lt: end } } },
      { $group: { _id: { month: { $month: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.month': 1 } },
    ]);
    return result.map(r => ({ month: r._id.month, total: r.total }));
  }
}
