import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BillItem, BillItemDocument, BillStatus } from './bill-item.schema';
import { CreateBillItemDto } from './dto/create-bill-item.dto';

@Injectable()
export class BillItemsService {
  constructor(@InjectModel(BillItem.name) private billModel: Model<BillItemDocument>) {}

  async findByMonth(userId: string, year: number, month: number): Promise<BillItemDocument[]> {
    return this.billModel
      .find({ userId: new Types.ObjectId(userId), year, month })
      .populate('categoryId', 'name color icon')
      .sort({ dueDay: 1 })
      .exec();
  }

  async create(userId: string, dto: CreateBillItemDto): Promise<BillItemDocument> {
    const bill = new this.billModel({
      ...dto,
      userId: new Types.ObjectId(userId),
      categoryId: dto.categoryId ? new Types.ObjectId(dto.categoryId) : undefined,
    });
    return bill.save();
  }

  async update(userId: string, id: string, dto: Partial<CreateBillItemDto>): Promise<BillItemDocument> {
    const update: Record<string, unknown> = { ...dto };
    if (dto.categoryId) update.categoryId = new Types.ObjectId(dto.categoryId);
    const bill = await this.billModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      update,
      { new: true },
    ).populate('categoryId', 'name color icon').exec();
    if (!bill) throw new NotFoundException('Pago no encontrado');
    return bill;
  }

  async toggleStatus(userId: string, id: string): Promise<BillItemDocument> {
    const bill = await this.billModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    }).exec();
    if (!bill) throw new NotFoundException('Pago no encontrado');
    bill.status = bill.status === BillStatus.PAID ? BillStatus.PENDING : BillStatus.PAID;
    bill.paidAt = bill.status === BillStatus.PAID ? new Date() : undefined;
    return bill.save();
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.billModel.deleteOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    }).exec();
    if (result.deletedCount === 0) throw new NotFoundException('Pago no encontrado');
  }

  async getTotalPaidByMonth(userId: string, year: number, month: number): Promise<number> {
    const result = await this.billModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId), year, month, status: BillStatus.PAID } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  async copyToNextMonth(userId: string, year: number, month: number): Promise<number> {
    const uid = new Types.ObjectId(userId);
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 12) { nextMonth = 1; nextYear++; }

    const existing = await this.billModel.countDocuments({ userId: uid, year: nextYear, month: nextMonth });
    if (existing > 0) return 0;

    const bills = await this.billModel.find({ userId: uid, year, month, isRecurring: true }).exec();
    if (bills.length === 0) return 0;

    const copies = bills.map(b => ({
      userId: uid,
      name: b.name,
      amount: b.amount,
      categoryId: b.categoryId,
      dueDay: b.dueDay,
      year: nextYear,
      month: nextMonth,
      status: BillStatus.PENDING,
      isRecurring: true,
      notes: b.notes,
    }));
    await this.billModel.insertMany(copies);
    return copies.length;
  }
}
