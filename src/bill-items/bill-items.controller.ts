import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BillItemsService } from './bill-items.service';
import { CreateBillItemDto } from './dto/create-bill-item.dto';

@UseGuards(JwtAuthGuard)
@Controller('bill-items')
export class BillItemsController {
  constructor(private billItemsService: BillItemsService) {}

  @Get()
  findByMonth(
    @CurrentUser() user: any,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.billItemsService.findByMonth(user.id, parseInt(year), parseInt(month));
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateBillItemDto) {
    return this.billItemsService.create(user.id, dto);
  }

  @Put(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: CreateBillItemDto) {
    return this.billItemsService.update(user.id, id, dto);
  }

  @Patch(':id/toggle')
  toggle(@CurrentUser() user: any, @Param('id') id: string) {
    return this.billItemsService.toggleStatus(user.id, id);
  }

  @Post('copy-next-month')
  copyToNextMonth(
    @CurrentUser() user: any,
    @Body('year') year: number,
    @Body('month') month: number,
  ) {
    return this.billItemsService.copyToNextMonth(user.id, year, month);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.billItemsService.remove(user.id, id);
  }
}
