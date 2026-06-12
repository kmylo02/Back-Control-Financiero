import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BillItem, BillItemSchema } from './bill-item.schema';
import { BillItemsService } from './bill-items.service';
import { BillItemsController } from './bill-items.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: BillItem.name, schema: BillItemSchema }])],
  providers: [BillItemsService],
  controllers: [BillItemsController],
  exports: [BillItemsService],
})
export class BillItemsModule {}
