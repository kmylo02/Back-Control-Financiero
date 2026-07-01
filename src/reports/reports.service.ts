import { Injectable } from '@nestjs/common';
import { ExpensesService } from '../expenses/expenses.service';
import { IncomesService } from '../incomes/incomes.service';
import { BudgetsService } from '../budgets/budgets.service';
import { BillItemsService } from '../bill-items/bill-items.service';

@Injectable()
export class ReportsService {
  constructor(
    private expensesService: ExpensesService,
    private incomesService: IncomesService,
    private budgetsService: BudgetsService,
    private billItemsService: BillItemsService,
  ) {}

  async getMonthlySummary(userId: string, year: number, month: number) {
    const [expenses, incomes, byCategoryRaw, agendaTotalPaid] = await Promise.all([
      this.expensesService.getTotalByMonth(userId, year, month),
      this.incomesService.getTotalByMonth(userId, year, month),
      this.expensesService.getByCategoryForMonth(userId, year, month),
      this.billItemsService.getTotalPaidByMonth(userId, year, month),
    ]);

    const byCategory = byCategoryRaw.map(c => ({
      categoryId: c._id.toString(),
      total: c.total,
      count: c.count,
    }));

    const budgetSummary = await this.budgetsService.getSummary(userId, year, month, expenses, byCategory);

    const totalGastado = expenses + agendaTotalPaid;

    return {
      year,
      month,
      totalExpenses: expenses,
      agendaTotalPaid,
      totalGastado,
      totalIncomes: incomes,
      balance: incomes - totalGastado,
      byCategory: byCategoryRaw,
      budget: budgetSummary,
    };
  }

  async getYearlySummary(userId: string, year: number) {
    const [expensesByMonth, incomesByMonth] = await Promise.all([
      this.expensesService.getMonthlyTotals(userId, year),
      this.incomesService.getMonthlyTotals(userId, year),
    ]);

    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const data = months.map(m => {
      const exp = expensesByMonth.find(e => e.month === m)?.total ?? 0;
      const inc = incomesByMonth.find(i => i.month === m)?.total ?? 0;
      return { month: m, expenses: exp, incomes: inc, balance: inc - exp };
    });

    const totalExpenses = data.reduce((acc, d) => acc + d.expenses, 0);
    const totalIncomes = data.reduce((acc, d) => acc + d.incomes, 0);

    return {
      year,
      months: data,
      totalExpenses,
      totalIncomes,
      balance: totalIncomes - totalExpenses,
      averageMonthlyExpense: totalExpenses / 12,
      averageMonthlyIncome: totalIncomes / 12,
    };
  }

  async compareMonths(userId: string, year: number, month: number) {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    const [currentExp, currentInc, currentAgenda,
           prevExp, prevInc, prevAgenda,
           sameMonthLastYearExp, sameMonthLastYearInc, sameMonthLastYearAgenda] =
      await Promise.all([
        this.expensesService.getTotalByMonth(userId, year, month),
        this.incomesService.getTotalByMonth(userId, year, month),
        this.billItemsService.getTotalPaidByMonth(userId, year, month),
        this.expensesService.getTotalByMonth(userId, prevYear, prevMonth),
        this.incomesService.getTotalByMonth(userId, prevYear, prevMonth),
        this.billItemsService.getTotalPaidByMonth(userId, prevYear, prevMonth),
        this.expensesService.getTotalByMonth(userId, year - 1, month),
        this.incomesService.getTotalByMonth(userId, year - 1, month),
        this.billItemsService.getTotalPaidByMonth(userId, year - 1, month),
      ]);

    const currentTotal  = currentExp + currentAgenda;
    const prevTotal     = prevExp + prevAgenda;
    const sameYearTotal = sameMonthLastYearExp + sameMonthLastYearAgenda;

    const expVsPrev = prevTotal > 0 ? Math.round(((currentTotal - prevTotal) / prevTotal) * 100) : null;
    const expVsLastYear = sameYearTotal > 0
      ? Math.round(((currentTotal - sameYearTotal) / sameYearTotal) * 100)
      : null;

    return {
      current: {
        year, month,
        expenses: currentExp,
        agendaTotalPaid: currentAgenda,
        totalGastado: currentTotal,
        incomes: currentInc,
        balance: currentInc - currentTotal,
      },
      previousMonth: {
        year: prevYear, month: prevMonth,
        expenses: prevExp, agendaTotalPaid: prevAgenda, totalGastado: prevTotal, incomes: prevInc,
      },
      sameMonthLastYear: {
        year: year - 1, month,
        expenses: sameMonthLastYearExp, agendaTotalPaid: sameMonthLastYearAgenda, totalGastado: sameYearTotal, incomes: sameMonthLastYearInc,
      },
      changes: {
        expensesVsPreviousMonth: expVsPrev,
        expensesVsLastYear: expVsLastYear,
      },
    };
  }

  async getYearComparison(userId: string, year: number) {
    const [current, previous] = await Promise.all([
      this.getYearlySummary(userId, year),
      this.getYearlySummary(userId, year - 1),
    ]);

    const expChangePercent = previous.totalExpenses > 0
      ? Math.round(((current.totalExpenses - previous.totalExpenses) / previous.totalExpenses) * 100)
      : null;

    const incChangePercent = previous.totalIncomes > 0
      ? Math.round(((current.totalIncomes - previous.totalIncomes) / previous.totalIncomes) * 100)
      : null;

    return {
      currentYear: current,
      previousYear: previous,
      changes: {
        expensesPercent: expChangePercent,
        incomesPercent: incChangePercent,
      },
    };
  }
}
