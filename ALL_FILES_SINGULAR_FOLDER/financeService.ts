import { FarmExpense, FarmEarning, ExpenseCategory } from '../types';

const STORAGE_KEY_EXPENSES = 'amip_farm_expenses_v1';
const STORAGE_KEY_EARNINGS = 'amip_farm_earnings_v1';

const DEFAULT_EXPENSES: FarmExpense[] = [
  {
    id: 'exp-01',
    amount: 8500,
    date: '2026-08-05',
    category: 'Seeds',
    vendorOrLocation: 'Kisan Krishi Seva Kendra, Pimpalgaon',
    note: 'Syngenta Abhinav F1 Tomato Seeds (5 packets)',
    season: 'Kharif 2026',
    createdAt: '2026-08-05'
  },
  {
    id: 'exp-02',
    amount: 9200,
    date: '2026-08-10',
    category: 'Fertilizer',
    vendorOrLocation: 'IFFCO Agro Center, Niphad',
    note: '10:26:26 NPK, Urea, and Micronutrient mixture',
    season: 'Kharif 2026',
    createdAt: '2026-08-10'
  },
  {
    id: 'exp-03',
    amount: 3400,
    date: '2026-08-15',
    category: 'Pesticides',
    vendorOrLocation: 'Mahalaxmi Krishi Seva Kendra',
    note: 'Bio-fungicide and Neem oil spray for leaf curl prevention',
    season: 'Kharif 2026',
    createdAt: '2026-08-15'
  },
  {
    id: 'exp-04',
    amount: 4500,
    date: '2026-08-20',
    category: 'Labour',
    vendorOrLocation: 'Local Village Harvesters',
    note: 'Transplanting and weeding labour (6 workers)',
    season: 'Kharif 2026',
    createdAt: '2026-08-20'
  },
  {
    id: 'exp-05',
    amount: 1400,
    date: '2026-08-22',
    category: 'Transport',
    vendorOrLocation: 'Tempo Transport Association, Nashik',
    note: 'Transport of 20 crates to local collection center',
    season: 'Kharif 2026',
    createdAt: '2026-08-22'
  }
];

const DEFAULT_EARNINGS: FarmEarning[] = [
  {
    id: 'earn-01',
    crop: 'Tomato',
    quantitySold: 25,
    unit: 'quintal',
    sellingPrice: 2450,
    totalEarnings: 61250,
    date: '2026-08-24',
    market: 'Pimpalgaon APMC Gate Auction',
    buyer: 'FreshBasket Hypermarkets',
    notes: 'Grade A produce sold at direct auction premium',
    createdAt: '2026-08-24'
  },
  {
    id: 'earn-02',
    crop: 'Onion',
    quantitySold: 10,
    unit: 'quintal',
    sellingPrice: 2700,
    totalEarnings: 27000,
    date: '2026-08-12',
    market: 'Lasalgaon APMC',
    buyer: 'Shree Ganesh Traders',
    notes: 'Early Kharif red onion lot',
    createdAt: '2026-08-12'
  }
];

export class FinanceService {
  private static instance: FinanceService;

  private constructor() {}

  public static getInstance(): FinanceService {
    if (!FinanceService.instance) {
      FinanceService.instance = new FinanceService();
    }
    return FinanceService.instance;
  }

  public getExpenses(): FarmExpense[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXPENSES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read expenses from localStorage', e);
    }
    return DEFAULT_EXPENSES;
  }

  public saveExpenses(expenses: FarmExpense[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.warn('Could not save expenses to localStorage', e);
    }
  }

  public addExpense(expense: Omit<FarmExpense, 'id' | 'createdAt'>): FarmExpense {
    const expenses = this.getExpenses();
    const newExpense: FarmExpense = {
      ...expense,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newExpense, ...expenses];
    this.saveExpenses(updated);
    return newExpense;
  }

  public deleteExpense(id: string): void {
    const expenses = this.getExpenses().filter(e => e.id !== id);
    this.saveExpenses(expenses);
  }

  public getEarnings(): FarmEarning[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EARNINGS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read earnings from localStorage', e);
    }
    return DEFAULT_EARNINGS;
  }

  public saveEarnings(earnings: FarmEarning[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_EARNINGS, JSON.stringify(earnings));
    } catch (e) {
      console.warn('Could not save earnings to localStorage', e);
    }
  }

  public addEarning(earning: Omit<FarmEarning, 'id' | 'createdAt'>): FarmEarning {
    const earnings = this.getEarnings();
    const newEarning: FarmEarning = {
      ...earning,
      id: `earn-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newEarning, ...earnings];
    this.saveEarnings(updated);
    return newEarning;
  }

  public deleteEarning(id: string): void {
    const earnings = this.getEarnings().filter(e => e.id !== id);
    this.saveEarnings(earnings);
  }

  public getFinancialSummary() {
    const expenses = this.getExpenses();
    const earnings = this.getEarnings();

    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const totalEarnings = earnings.reduce((sum, item) => sum + item.totalEarnings, 0);
    const netProfit = totalEarnings - totalExpenses;
    const profitMarginPct = totalEarnings > 0 ? Number(((netProfit / totalEarnings) * 100).toFixed(1)) : 0;

    // Breakdown by Category
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const categoryBreakdown = Object.entries(categoryTotals).map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);

    return {
      totalEarnings,
      totalExpenses,
      netProfit,
      profitMarginPct,
      categoryBreakdown,
      expensesCount: expenses.length,
      earningsCount: earnings.length
    };
  }

  public generateAiFinancialGuidance(): Array<{ title: string; detail: string; impact: 'POSITIVE' | 'NEUTRAL' | 'WARNING' }> {
    const summary = this.getFinancialSummary();
    const insights: Array<{ title: string; detail: string; impact: 'POSITIVE' | 'NEUTRAL' | 'WARNING' }> = [];

    // 1. Profitability check
    if (summary.netProfit > 0) {
      insights.push({
        title: 'Positive Farm Cash Flow & Net Profit',
        detail: `Your current net profit stands at ₹${summary.netProfit.toLocaleString('en-IN')} with a healthy ${summary.profitMarginPct}% profit margin.`,
        impact: 'POSITIVE'
      });
    } else if (summary.totalEarnings === 0) {
      insights.push({
        title: 'Active Crop Cycle Investment Phase',
        detail: `You have invested ₹${summary.totalExpenses.toLocaleString('en-IN')} in inputs (seeds, fertilizer, labour). Your profit will realize upon upcoming harvest sales.`,
        impact: 'NEUTRAL'
      });
    } else {
      insights.push({
        title: 'Input Cost Exceeds Current Realization',
        detail: `Total expenses exceed current sales by ₹${Math.abs(summary.netProfit).toLocaleString('en-IN')}. Consider checking direct B2B buyer offers to maximize selling rate.`,
        impact: 'WARNING'
      });
    }

    // 2. High cost category alerts
    const fertilizerExpense = summary.categoryBreakdown.find(c => c.category === 'Fertilizer');
    if (fertilizerExpense && fertilizerExpense.percentage > 30) {
      insights.push({
        title: `Fertilizer represents ${fertilizerExpense.percentage}% of total expenses`,
        detail: 'Consider soil health card recommendations and bio-fertilizer integration (DAP/Urea balance) to reduce nutrient costs by 15-20%.',
        impact: 'WARNING'
      });
    }

    const transportExpense = summary.categoryBreakdown.find(c => c.category === 'Transport');
    if (transportExpense && transportExpense.amount > 2000) {
      insights.push({
        title: 'Farmgate Direct Pickup Cost Savings',
        detail: 'Choosing buyers who offer on-farm vehicle pickup eliminates mandi transportation and handling cess.',
        impact: 'POSITIVE'
      });
    }

    // 3. Storage realization note
    insights.push({
      title: 'Seasonal Price Trajectory Benefit',
      detail: 'Historical data shows selling in staggered 7-10 day windows during peak festival demand yields +12% higher final modal rate.',
      impact: 'POSITIVE'
    });

    return insights;
  }
}
