import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument, CategoryType } from './category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';

const DEFAULT_CATEGORIES = [
  { name: 'Arriendo/Hipoteca', type: CategoryType.EXPENSE, icon: 'home', color: '#ef4444', isDefault: true },
  { name: 'Servicios públicos', type: CategoryType.EXPENSE, icon: 'flash', color: '#f97316', isDefault: true },
  { name: 'Alimentación', type: CategoryType.EXPENSE, icon: 'restaurant', color: '#eab308', isDefault: true },
  { name: 'Transporte', type: CategoryType.EXPENSE, icon: 'car', color: '#22c55e', isDefault: true },
  { name: 'Salud', type: CategoryType.EXPENSE, icon: 'medkit', color: '#06b6d4', isDefault: true },
  { name: 'Entretenimiento', type: CategoryType.EXPENSE, icon: 'film', color: '#8b5cf6', isDefault: true },
  { name: 'Ropa', type: CategoryType.EXPENSE, icon: 'shirt', color: '#ec4899', isDefault: true },
  { name: 'Educación', type: CategoryType.EXPENSE, icon: 'school', color: '#14b8a6', isDefault: true },
  { name: 'Gastos hormiga', type: CategoryType.EXPENSE, icon: 'cafe', color: '#a16207', isDefault: true },
  { name: 'Suscripciones', type: CategoryType.EXPENSE, icon: 'card', color: '#6366f1', isDefault: true },
  { name: 'Salario', type: CategoryType.INCOME, icon: 'cash', color: '#16a34a', isDefault: true },
  { name: 'Freelance', type: CategoryType.INCOME, icon: 'laptop', color: '#0ea5e9', isDefault: true },
  { name: 'Otros ingresos', type: CategoryType.INCOME, icon: 'trending-up', color: '#7c3aed', isDefault: true },
];

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  async seedDefaults(userId: string): Promise<void> {
    const uid = new Types.ObjectId(userId);
    const count = await this.categoryModel.countDocuments({ userId: uid, isDefault: true });
    if (count === DEFAULT_CATEGORIES.length) return;
    await this.categoryModel.deleteMany({ userId: uid, isDefault: true });
    const defaults = DEFAULT_CATEGORIES.map(cat => ({ ...cat, userId: uid }));
    await this.categoryModel.insertMany(defaults);
  }

  async create(userId: string, dto: CreateCategoryDto): Promise<CategoryDocument> {
    const category = new this.categoryModel({ ...dto, userId: new Types.ObjectId(userId) });
    return category.save();
  }

  async findAll(userId: string, type?: CategoryType): Promise<CategoryDocument[]> {
    await this.seedDefaults(userId);
    const uid = new Types.ObjectId(userId);
    const filter: Record<string, unknown> = { userId: uid };
    if (type) filter.type = { $in: [type, CategoryType.BOTH] };
    return this.categoryModel.find(filter).sort({ name: 1 }).exec();
  }

  async update(userId: string, id: string, dto: Partial<CreateCategoryDto>): Promise<CategoryDocument> {
    const category = await this.categoryModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      dto,
      { new: true },
    ).exec();
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }

  async remove(userId: string, id: string): Promise<void> {
    const category = await this.categoryModel.findOne({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) }).exec();
    if (!category) throw new NotFoundException('Categoría no encontrada');
    if (category.isDefault) throw new ForbiddenException('No se pueden eliminar categorías predeterminadas');
    await this.categoryModel.deleteOne({ _id: new Types.ObjectId(id) }).exec();
  }
}
