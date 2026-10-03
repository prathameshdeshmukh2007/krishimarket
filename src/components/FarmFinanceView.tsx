import React, { useState } from 'react';
import { 
  DollarSign, 
  PlusCircle, 
  Trash2, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Tag,
  ArrowRight,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  FarmExpense, 
  FarmEarning, 
  ExpenseCategory, 
  LanguageCode 
} from '../types';
import { translations } from '../i18n/translations';
import { FinanceService } from '../services/financeService';

interface FarmFinanceViewProps {
  language: LanguageCode;
}

export const FarmFinanceView: React.FC<FarmFinanceViewProps> = ({ language }) => {
  const t = translations[language];
  const financeService = FinanceService.getInstance();

  // Active sub-tab: 'overview' | 'add_expense' | 'add_earning'
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'add_expense' | 'add_earning'>('overview');

  // Expense form state
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Fertilizer');
  const [expVendor, setExpVendor] = useState('');
  const [expNote, setExpNote] = useState('');

  // Earning form state
  const [earnCrop, setEarnCrop] = useState('Tomato');
  const [earnQty, setEarnQty] = useState('20');
  const [earnUnit, setEarnUnit] = useState<'kg' | 'quintal' | 'ton'>('quintal');
  const [earnRate, setEarnRate] = useState('2500');
  const [earnDate, setEarnDate] = useState(new Date().toISOString().split('T')[0]);
  const [earnMarket, setEarnMarket] = useState('Pimpalgaon APMC Gate Auction');
  const [earnBuyer, setEarnBuyer] = useState('FreshBasket Wholesale');
  const [earnNote, setEarnNote] = useState('');

  // Finance Summary Data
  const [summary, setSummary] = useState(financeService.getFinancialSummary());
  const [expenses, setExpenses] = useState<FarmExpense[]>(financeService.getExpenses());
  const [earnings, setEarnings] = useState<FarmEarning[]>(financeService.getEarnings());
  const aiInsights = financeService.generateAiFinancialGuidance();

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expAmount);
    if (!amt || amt <= 0) return;

    financeService.addExpense({
      amount: amt,
      date: expDate,
      category: expCategory,
      vendorOrLocation: expVendor || 'Local Agro Vendor',
      note: expNote,
      season: 'Kharif 2026'
    });

    setExpenses(financeService.getExpenses());
    setSummary(financeService.getFinancialSummary());
    setExpAmount('');
    setExpVendor('');
    setExpNote('');
    setActiveSubTab('overview');
  };

  const handleSaveEarning = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(earnQty);
    const rate = parseFloat(earnRate);
    if (!qty || !rate) return;

    const total = qty * rate;

    financeService.addEarning({
      crop: earnCrop,
      quantitySold: qty,
      unit: earnUnit,
      sellingPrice: rate,
      totalEarnings: total,
      date: earnDate,
      market: earnMarket,
      buyer: earnBuyer,
      notes: earnNote
    });

    setEarnings(financeService.getEarnings());
    setSummary(financeService.getFinancialSummary());
    setEarnQty('');
    setEarnRate('');
    setEarnNote('');
    setActiveSubTab('overview');
  };

  const handleDeleteExpense = (id: string) => {
    financeService.deleteExpense(id);
    setExpenses(financeService.getExpenses());
    setSummary(financeService.getFinancialSummary());
  };

  const handleDeleteEarning = (id: string) => {
    financeService.deleteEarning(id);
    setEarnings(financeService.getEarnings());
    setSummary(financeService.getFinancialSummary());
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white shadow-xl shadow-emerald-800/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold font-mono">
              <DollarSign className="w-3.5 h-3.5 text-amber-300" />
              <span>MY FARM MONEY & FINANCIAL ADVICE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading">
              {t.farmMoneyTitle}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium">
              {t.farmMoneySubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('add_expense')}
              className="px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.addExpenseBtn}</span>
            </button>

            <button
              onClick={() => setActiveSubTab('add_earning')}
              className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.addEarningBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* CORE 3-WAY FINANCIAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        
        {/* Earnings Card */}
        <div className="farmer-card p-5 border-2 border-emerald-500/30 space-y-2 bg-gradient-to-b from-emerald-50/40 dark:from-emerald-950/20 to-transparent">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-heading flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>{t.myEarnings}</span>
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-heading">
            ₹{summary.totalEarnings.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            From {summary.earningsCount} recorded crop sales
          </div>
        </div>

        {/* Expenses Card */}
        <div className="farmer-card p-5 border-2 border-rose-500/30 space-y-2 bg-gradient-to-b from-rose-50/40 dark:from-rose-950/20 to-transparent">
          <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider font-heading flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-rose-600" />
            <span>{t.myExpenses}</span>
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-heading">
            ₹{summary.totalExpenses.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Across {summary.expensesCount} input expenditure items
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="farmer-card p-5 border-2 border-emerald-500 space-y-2 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-lg">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider font-heading flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{t.myProfit} (Earnings - Expenses)</span>
          </span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-heading">
            ₹{summary.netProfit.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
            Profit Margin: {summary.profitMarginPct}% of revenue
          </div>
        </div>

      </div>

      {/* MODAL / FORM: ADD NEW EXPENSE */}
      {activeSubTab === 'add_expense' && (
        <div className="farmer-card p-6 border-2 border-rose-500/40 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
              <span>🧾</span>
              <span>{t.addExpenseBtn}</span>
            </h3>
            <button
              onClick={() => setActiveSubTab('overview')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              {t.btnCancel}
            </button>
          </div>

          <form onSubmit={handleSaveExpense} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.expenseAmountLabel} <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                placeholder="e.g. 4500"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.expenseCategoryLabel}
              </label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Seeds">{t.catSeeds}</option>
                <option value="Fertilizer">{t.catFertilizer}</option>
                <option value="Pesticides">{t.catPesticides}</option>
                <option value="Labour">{t.catLabour}</option>
                <option value="Water/Irrigation">{t.catWater}</option>
                <option value="Machinery">{t.catMachinery}</option>
                <option value="Transport">{t.catTransport}</option>
                <option value="Storage">{t.catStorage}</option>
                <option value="Other">{t.catOther}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.expenseDateLabel}
              </label>
              <input
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.expenseVendorLabel}
              </label>
              <input
                type="text"
                value={expVendor}
                onChange={(e) => setExpVendor(e.target.value)}
                placeholder="e.g. Kisan Seva Kendra Pimpalgaon"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.expenseNoteLabel}
              </label>
              <input
                type="text"
                value={expNote}
                onChange={(e) => setExpNote(e.target.value)}
                placeholder="e.g. 5 bags 10:26:26 NPK fertilizer"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('overview')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                {t.btnCancel}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md"
              >
                {t.expenseSaveBtn}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL / FORM: ADD NEW EARNING */}
      {activeSubTab === 'add_earning' && (
        <div className="farmer-card p-6 border-2 border-emerald-500/40 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
              <span>💰</span>
              <span>{t.addEarningBtn}</span>
            </h3>
            <button
              onClick={() => setActiveSubTab('overview')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              {t.btnCancel}
            </button>
          </div>

          <form onSubmit={handleSaveEarning} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.earningCropLabel} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={earnCrop}
                onChange={(e) => setEarnCrop(e.target.value)}
                placeholder="e.g. Tomato / Onion"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.earningQtyLabel}
                </label>
                <input
                  type="number"
                  value={earnQty}
                  onChange={(e) => setEarnQty(e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Unit
                </label>
                <select
                  value={earnUnit}
                  onChange={(e) => setEarnUnit(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="quintal">Quintal</option>
                  <option value="kg">Kg</option>
                  <option value="ton">Ton</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.earningRateLabel} <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={earnRate}
                onChange={(e) => setEarnRate(e.target.value)}
                placeholder="e.g. 2450"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.earningMarketLabel}
              </label>
              <input
                type="text"
                value={earnMarket}
                onChange={(e) => setEarnMarket(e.target.value)}
                placeholder="e.g. FreshBasket Procurement"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Total Calculated Revenue:</span>
                <span className="text-base text-emerald-600 dark:text-emerald-400 font-heading">
                  ₹{((parseFloat(earnQty) || 0) * (parseFloat(earnRate) || 0)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('overview')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                {t.btnCancel}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
              >
                {t.earningSaveBtn}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AI FINANCIAL GUIDANCE TIPS */}
      <div className="farmer-card p-5 space-y-3 bg-gradient-to-r from-emerald-50/60 dark:from-emerald-950/30 to-transparent border border-emerald-300 dark:border-emerald-800/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider font-heading">
            {t.aiFinancialGuidanceTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiInsights.map((insight, idx) => (
            <div 
              key={idx} 
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 space-y-1"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{insight.impact === 'POSITIVE' ? '✅' : insight.impact === 'WARNING' ? '⚠️' : 'ℹ️'}</span>
                <span>{insight.title}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {insight.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* EXPENSES & EARNINGS LOG TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Expenses Table */}
        <div className="farmer-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-heading flex items-center gap-2">
              <span className="text-rose-500">📉</span>
              <span>{t.recentExpensesList} ({expenses.length})</span>
            </h3>
            <button
              onClick={() => setActiveSubTab('add_expense')}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
            >
              + Add
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {expenses.map((e) => (
              <div key={e.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-[10px]">{e.category}</span>
                    <span>{e.note || e.vendorOrLocation}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {e.date} • {e.vendorOrLocation}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-black text-rose-600 dark:text-rose-400 font-heading">
                    -₹{e.amount.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(e.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings Table */}
        <div className="farmer-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-heading flex items-center gap-2">
              <span className="text-emerald-500">📈</span>
              <span>{t.recentEarningsList} ({earnings.length})</span>
            </h3>
            <button
              onClick={() => setActiveSubTab('add_earning')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              + Add
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {earnings.map((earn) => (
              <div key={earn.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{earn.crop}</span>
                    <span className="text-[10px] text-slate-500 font-normal">({earn.quantitySold} {earn.unit})</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {earn.date} • {earn.market}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-heading">
                    +₹{earn.totalEarnings.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => handleDeleteEarning(earn.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
