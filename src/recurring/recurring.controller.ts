import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RecurringService } from './recurring.service';
import { CreateRecurringDto } from './dto/create-recurring.dto';

@UseGuards(JwtAuthGuard)
@Controller('recurring')
export class RecurringController {
  constructor(private recurringService: RecurringService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.recurringService.findAll(user.id);
  }

  @Get('pending')
  pending(@CurrentUser() user: any) {
    return this.recurringService.getPendingForCurrentMonth(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.recurringService.findOne(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateRecurringDto) {
    return this.recurringService.create(user.id, dto);
  }

  @Post(':id/activate')
  activate(@CurrentUser() user: any, @Param('id') id: string, @Body('amount') amount?: number) {
    return this.recurringService.activate(user.id, id, amount);
  }

  @Put(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: CreateRecurringDto) {
    return this.recurringService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.recurringService.remove(user.id, id);
  }
}
