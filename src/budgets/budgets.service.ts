import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Budget, BudgetDocument } from './budget.schema';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(@InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>) {}

  async upsert(userId: string, dto: CreateBudgetDto): Promise<BudgetDocument> {
    const categoryLimits = (dto.categoryLimits ?? []).map(cl => ({
      categoryId: new Types.ObjectId(cl.categoryId),
      limit: cl.limit,
    }));

    return this.budgetModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), year: dto.year, month: dto.month },
      { totalLimit: dto.totalLimit, categoryLimits },
      { new: true, upsert: true },
    ).exec();
  }

  async findByMonth(userId: string, year: number, month: number): Promise<BudgetDocument | null> {
    return this.budgetModel
      .findOne({ userId: new Types.ObjectId(userId), year, month })
      .populate('categoryLimits.categoryId', 'name icon color')
      .exec();
  }

  async findByYear(userId: string, year: number): Promise<BudgetDocument[]> {
    return this.budgetModel
      .find({ userId: new Types.ObjectId(userId), year })
      .sort({ month: 1 })
      .exec();
  }

  async getSummary(userId: string, year: number, month: number, totalSpent: number, byCategorySpent: { categoryId: string; total: number }[]) {
    const budget = await this.findByMonth(userId, year, month);

    if (!budget) {
      return { budget: null, totalSpent, remaining: null, usagePercent: null, categoryBreakdown: [] };
    }

    const remaining = budget.totalLimit - totalSpent;
    const usagePercent = budget.totalLimit > 0 ? Math.round((totalSpent / budget.totalLimit) * 100) : 0;

    const categoryBreakdown = budget.categoryLimits.map(cl => {
      const spent = byCategorySpent.find(c => c.categoryId === cl.categoryId.toString())?.total ?? 0;
      return {
        categoryId: cl.categoryId,
        limit: cl.limit,
        spent,
        remaining: cl.limit - spent,
        usagePercent: cl.limit > 0 ? Math.round((spent / cl.limit) * 100) : 0,
      };
    });

    return { budget, totalSpent, remaining, usagePercent, categoryBreakdown };
  }

  async remove(userId: string, year: number, month: number): Promise<void> {
    const result = await this.budgetModel.deleteOne({ userId: new Types.ObjectId(userId), year, month }).exec();
    if (result.deletedCount === 0) throw new NotFoundException('Presupuesto no encontrado');
  }
}
