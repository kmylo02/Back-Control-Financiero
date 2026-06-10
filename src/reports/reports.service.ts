import { Injectable } from '@nestjs/common';
import { ExpensesService } from '../expenses/expenses.service';
import { IncomesService } from '../incomes/incomes.service';
import { BudgetsService } from '../budgets/budgets.service';

@Injectable()
export class ReportsService {
  constructor(
    private expensesService: ExpensesService,
    private incomesService: IncomesService,
    private budgetsService: BudgetsService,
  ) {}

  async getMonthlySummary(userId: string, year: number, month: number) {
    const [expenses, incomes, byCategoryRaw] = await Promise.all([
      this.expensesService.getTotalByMonth(userId, year, month),
      this.incomesService.getTotalByMonth(userId, year, month),
      this.expensesService.getByCategoryForMonth(userId, year, month),
    ]);

    const byCategory = byCategoryRaw.map(c => ({
      categoryId: c._id.toString(),
      total: c.total,
      count: c.count,
    }));

    const budgetSummary = await this.budgetsService.getSummary(userId, year, month, expenses, byCategory);

    return {
      year,
      month,
      totalExpenses: expenses,
      totalIncomes: incomes,
      balance: incomes - expenses,
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
    const prevPrevMonth = prevMonth === 1 ? 12 : prevMonth - 1;
    const prevPrevYear = prevMonth === 1 ? prevYear - 1 : prevYear;

    const [currentExp, currentInc, prevExp, prevInc, sameMonthLastYearExp, sameMonthLastYearInc] =
      await Promise.all([
        this.expensesService.getTotalByMonth(userId, year, month),
        this.incomesService.getTotalByMonth(userId, year, month),
        this.expensesService.getTotalByMonth(userId, prevYear, prevMonth),
        this.incomesService.getTotalByMonth(userId, prevYear, prevMonth),
        this.expensesService.getTotalByMonth(userId, year - 1, month),
        this.incomesService.getTotalByMonth(userId, year - 1, month),
      ]);

    const expVsPrev = prevExp > 0 ? Math.round(((currentExp - prevExp) / prevExp) * 100) : null;
    const expVsLastYear = sameMonthLastYearExp > 0
      ? Math.round(((currentExp - sameMonthLastYearExp) / sameMonthLastYearExp) * 100)
      : null;

    return {
      current: { year, month, expenses: currentExp, incomes: currentInc, balance: currentInc - currentExp },
      previousMonth: { year: prevYear, month: prevMonth, expenses: prevExp, incomes: prevInc },
      sameMonthLastYear: { year: year - 1, month, expenses: sameMonthLastYearExp, incomes: sameMonthLastYearInc },
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
