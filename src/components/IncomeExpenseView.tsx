import React, { useState, useMemo } from 'react';
import {
  FinanceTransaction,
  InventoryItem,
  OrderItem,
  TransactionType,
  FinanceCategory,
} from '../types';
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  exportTransactionsToCSV,
} from '../utils/inventoryStorage';
import {
  IndianRupee,
  Plus,
  Minus,
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Trash2,
  Edit2,
  FileText,
  Package,
  Layers,
  X,
  CreditCard,
  Building2,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  BarChart3,
} from 'lucide-react';

interface IncomeExpenseViewProps {
  transactions: FinanceTransaction[];
  inventoryItems: InventoryItem[];
  orders: OrderItem[];
  onAddTransaction: (txn: FinanceTransaction) => void;
  onUpdateTransaction: (txn: FinanceTransaction) => void;
  onDeleteTransaction: (txnId: string) => void;
  onNavigateToReports: (targetDate?: string) => void;
}

export const IncomeExpenseView: React.FC<IncomeExpenseViewProps> = ({
  transactions,
  inventoryItems,
  orders,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onNavigateToReports,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD or empty

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<FinanceTransaction | null>(null);

  // Form State
  const [modalType, setModalType] = useState<TransactionType>('income');
  const [formData, setFormData] = useState<Partial<FinanceTransaction>>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    type: 'income',
    category: 'Flex Printing',
    itemId: '',
    itemName: '',
    quantity: 1,
    unit: 'sq.ft',
    unitPrice: 12,
    amount: 12,
    paymentMode: 'UPI / GPay / PhonePe',
    partyName: '',
    referenceOrderId: '',
    invoiceNumber: '',
    notes: '',
    affectsStock: false,
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (dateFilter && t.date !== dateFilter) return false;

      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchName = t.itemName.toLowerCase().includes(query);
        const matchParty = t.partyName?.toLowerCase().includes(query) || false;
        const matchCategory = t.category.toLowerCase().includes(query);
        const matchId = t.id.toLowerCase().includes(query);
        const matchRef = t.referenceOrderId?.toLowerCase().includes(query) || false;
        if (!matchName && !matchParty && !matchCategory && !matchId && !matchRef) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, filterType, categoryFilter, dateFilter, searchTerm]);

  // Aggregate stats
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    let cashTotal = 0;
    let upiTotal = 0;
    let bankTotal = 0;

    filteredTransactions.forEach((t) => {
      if (t.type === 'income') {
        income += t.amount;
        if (t.paymentMode === 'Cash') cashTotal += t.amount;
        else if (t.paymentMode === 'UPI / GPay / PhonePe') upiTotal += t.amount;
        else bankTotal += t.amount;
      } else {
        expense += t.amount;
        if (t.paymentMode === 'Cash') cashTotal -= t.amount;
        else if (t.paymentMode === 'UPI / GPay / PhonePe') upiTotal -= t.amount;
        else bankTotal -= t.amount;
      }
    });

    return {
      income,
      expense,
      net: income - expense,
      count: filteredTransactions.length,
      cashTotal,
      upiTotal,
      bankTotal,
    };
  }, [filteredTransactions]);

  const handleOpenAddModal = (type: TransactionType) => {
    setEditingTxn(null);
    setModalType(type);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      type,
      category: type === 'income' ? 'Flex Printing' : 'Raw Material Purchase',
      itemId: '',
      itemName: '',
      quantity: 1,
      unit: type === 'income' ? 'sq.ft' : 'Rolls',
      unitPrice: type === 'income' ? 12 : 1850,
      amount: type === 'income' ? 12 : 1850,
      paymentMode: 'UPI / GPay / PhonePe',
      partyName: '',
      referenceOrderId: '',
      invoiceNumber: '',
      notes: '',
      affectsStock: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: FinanceTransaction) => {
    setEditingTxn(t);
    setModalType(t.type);
    setFormData({ ...t });
    setIsModalOpen(true);
  };

  // When an inventory item is selected in form, auto-fill unit, price, and name
  const handleItemSelect = (itemId: string) => {
    const inv = inventoryItems.find((i) => i.id === itemId);
    if (!inv) {
      setFormData((prev) => ({ ...prev, itemId: '' }));
      return;
    }

    const price = modalType === 'income' ? inv.sellingPrice : inv.purchaseCost;
    const qty = formData.quantity || 1;

    setFormData((prev) => ({
      ...prev,
      itemId: inv.id,
      itemName: inv.name,
      unit: inv.unit,
      unitPrice: price,
      amount: qty * price,
      category:
        modalType === 'income'
          ? (inv.category === 'Flex Rolls' ? 'Flex Printing' : 'Stock Material Sale')
          : (inv.category.includes('Ink') ? 'Ink & Chemical Refill' : 'Raw Material Purchase'),
      affectsStock: true,
    }));
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemName?.trim()) return;

    const amount = Number(formData.amount) || (Number(formData.quantity) || 1) * (Number(formData.unitPrice) || 0);

    if (editingTxn) {
      const updated: FinanceTransaction = {
        ...editingTxn,
        date: formData.date || new Date().toISOString().split('T')[0],
        time: formData.time || new Date().toTimeString().slice(0, 5),
        type: modalType,
        category: (formData.category as FinanceCategory) || 'Job Work / Printing',
        itemId: formData.itemId || undefined,
        itemName: formData.itemName.trim(),
        quantity: Number(formData.quantity) || 1,
        unit: formData.unit || 'Pcs',
        unitPrice: Number(formData.unitPrice) || 0,
        amount,
        paymentMode: formData.paymentMode || 'UPI / GPay / PhonePe',
        partyName: formData.partyName?.trim() || undefined,
        referenceOrderId: formData.referenceOrderId?.trim() || undefined,
        invoiceNumber: formData.invoiceNumber?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        affectsStock: formData.affectsStock || false,
      };
      onUpdateTransaction(updated);
    } else {
      const newTxn: FinanceTransaction = {
        id: `TXN-${Date.now().toString().slice(-4)}`,
        date: formData.date || new Date().toISOString().split('T')[0],
        time: formData.time || new Date().toTimeString().slice(0, 5),
        type: modalType,
        category: (formData.category as FinanceCategory) || 'Job Work / Printing',
        itemId: formData.itemId || undefined,
        itemName: formData.itemName.trim(),
        quantity: Number(formData.quantity) || 1,
        unit: formData.unit || 'Pcs',
        unitPrice: Number(formData.unitPrice) || 0,
        amount,
        paymentMode: formData.paymentMode || 'UPI / GPay / PhonePe',
        partyName: formData.partyName?.trim() || undefined,
        referenceOrderId: formData.referenceOrderId?.trim() || undefined,
        invoiceNumber: formData.invoiceNumber?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        affectsStock: formData.affectsStock || false,
      };
      onAddTransaction(newTxn);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  Item-Wise Income & Expense Ledger
                </h1>
                <p className="text-xs text-slate-500">
                  Record printing billing, raw material purchases, machine costs, and daily cash transactions
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigateToReports(dateFilter || undefined)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-blue-600" />
              View Day & Monthly Reports
            </button>
            <button
              onClick={() => exportTransactionsToCSV(filteredTransactions)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-600" />
              Export CSV
            </button>
            <button
              onClick={() => handleOpenAddModal('expense')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4 text-rose-600" />
              - Record Expense
            </button>
            <button
              onClick={() => handleOpenAddModal('income')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Record Income
            </button>
          </div>
        </div>

        {/* Top Summary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800">Total Income</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-900 mt-1 font-mono">
              ₹{totals.income.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">
              Revenue from printing & sales
            </div>
          </div>

          <div className="bg-rose-50/60 border border-rose-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-800">Total Expense</span>
              <TrendingDown className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-rose-900 mt-1 font-mono">
              ₹{totals.expense.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-rose-700 mt-0.5">
              Materials, inks, electricity, wages
            </div>
          </div>

          <div className={`border rounded-lg p-4 ${totals.net >= 0 ? 'bg-blue-50/70 border-blue-200' : 'bg-red-50 border-red-300'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Net Operating Balance</span>
              <IndianRupee className="w-4 h-4 text-blue-600" />
            </div>
            <div className={`text-2xl font-bold mt-1 font-mono ${totals.net >= 0 ? 'text-blue-900' : 'text-rose-700'}`}>
              ₹{totals.net.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {totals.net >= 0 ? 'Positive Cash Flow' : 'Deficit in current filter'}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Payment Modes Split</span>
              <CreditCard className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xs font-medium text-slate-700 space-y-0.5 mt-1 font-mono">
              <div>UPI: ₹{totals.upiTotal.toLocaleString('en-IN')}</div>
              <div>Cash: ₹{totals.cashTotal.toLocaleString('en-IN')}</div>
              <div>Bank: ₹{totals.bankTotal.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Toggle */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({transactions.length})
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  filterType === 'income'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                Income Only
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  filterType === 'expense'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-700 hover:text-rose-900'
                }`}
              >
                Expense Only
              </button>
            </div>

            {/* Date Picker Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-700 focus:outline-hidden"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="text-slate-400 hover:text-slate-600 ml-1 text-xs font-bold"
                  title="Clear Date Filter"
                >
                  ×
                </button>
              )}
            </div>

            {dateFilter && (
              <button
                onClick={() => onNavigateToReports(dateFilter)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md hover:bg-blue-100 cursor-pointer"
              >
                Generate Day Report ({dateFilter}) <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search item, customer, vendor, ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider font-mono-code">
                <th className="py-3 px-4">Date & Txn ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Item Name (Item-Wise)</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Qty / Rate</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4">Party (Customer / Vendor)</th>
                <th className="py-3 px-4 text-center">Payment Mode</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No transactions recorded</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click "+ Record Income" or "- Record Expense" to log financial entries.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const isIncome = t.type === 'income';

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono">
                        <div className="font-semibold text-slate-800">{t.date}</div>
                        <div className="text-[10px] text-slate-400">
                          {t.time} • {t.id}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isIncome
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isIncome ? (
                            <>
                              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                              INCOME
                            </>
                          ) : (
                            <>
                              <ArrowDownLeft className="w-3 h-3 text-rose-600" />
                              EXPENSE
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{t.itemName}</div>
                        {t.referenceOrderId && (
                          <span className="inline-block mt-0.5 font-mono text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1 rounded">
                            Ref: {t.referenceOrderId}
                          </span>
                        )}
                        {t.notes && (
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">{t.notes}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {t.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        <div>
                          {t.quantity} {t.unit}
                        </div>
                        <div className="text-[10px] text-slate-400">@ ₹{t.unitPrice}/{t.unit}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-sm">
                        <span className={isIncome ? 'text-emerald-700' : 'text-rose-700'}>
                          {isIncome ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{t.partyName || '—'}</div>
                        {t.invoiceNumber && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Bill #{t.invoiceNumber}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-slate-100 border border-slate-200 rounded text-slate-700">
                          {t.paymentMode}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(t)}
                            className="p-1.5 hover:bg-slate-100 text-blue-600 rounded-md transition-colors cursor-pointer"
                            title="Edit Transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete transaction ${t.id} - ${t.itemName}?`)) {
                                onDeleteTransaction(t.id);
                              }
                            }}
                            className="p-1.5 hover:bg-slate-100 text-rose-600 rounded-md transition-colors cursor-pointer"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${modalType === 'income' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              <div className="flex items-center gap-2">
                {modalType === 'income' ? (
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-rose-600" />
                )}
                <h3 className="font-bold text-slate-800 text-base">
                  {editingTxn ? 'Edit Financial Record' : modalType === 'income' ? 'Record Income (Billed Item)' : 'Record Expense (Expenditure)'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Type Switcher */}
              <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setModalType('income');
                    setFormData((prev) => ({
                      ...prev,
                      type: 'income',
                      category: 'Flex Printing',
                    }));
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    modalType === 'income'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  + INCOME (Sales / Job Work)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalType('expense');
                    setFormData((prev) => ({
                      ...prev,
                      type: 'expense',
                      category: 'Raw Material Purchase',
                    }));
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    modalType === 'expense'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  - EXPENSE (Material / Wages / Spares)
                </button>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time || ''}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Quick Select from Inventory */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Quick Select from Inventory (Optional)
                </label>
                <select
                  value={formData.itemId || ''}
                  onChange={(e) => handleItemSelect(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="">-- Choose Stock Item or Type Below --</option>
                  {inventoryItems.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} (Stock: {inv.currentStock} {inv.unit} | Cost: ₹{inv.purchaseCost} | Sell: ₹{inv.sellingPrice})
                    </option>
                  ))}
                </select>
              </div>

              {/* Item Name (Item-Wise) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Item / Service Name (Item-Wise) *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    modalType === 'income'
                      ? 'e.g. Star Frontlit Flex (12x4 ft Banner), Visiting Cards 350 GSM'
                      : 'e.g. 5L Solvent Cyan Ink Can, Electricity Bill, Ramesh Wages'
                  }
                  value={formData.itemName || ''}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={formData.category || (modalType === 'income' ? 'Flex Printing' : 'Raw Material Purchase')}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as FinanceCategory })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {(modalType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity, Unit, Unit Rate, and Total Amount */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    required
                    value={formData.quantity ?? 1}
                    onChange={(e) => {
                      const qty = Number(e.target.value);
                      const rate = formData.unitPrice || 0;
                      setFormData({ ...formData, quantity: qty, amount: qty * rate });
                    }}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    placeholder="sq.ft, pcs..."
                    value={formData.unit || 'sq.ft'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Rate (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={formData.unitPrice ?? 0}
                    onChange={(e) => {
                      const rate = Number(e.target.value);
                      const qty = formData.quantity || 1;
                      setFormData({ ...formData, unitPrice: rate, amount: qty * rate });
                    }}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Total Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={formData.amount ?? 0}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Payment Mode & Party Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={formData.paymentMode || 'UPI / GPay / PhonePe'}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as any })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="UPI / GPay / PhonePe">UPI / GPay / PhonePe</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Credit">Credit / Due</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {modalType === 'income' ? 'Customer Name' : 'Vendor / Payee Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={modalType === 'income' ? 'e.g. Sahu Kirana' : 'e.g. Radhey Vinyl, Ramesh Sharma'}
                    value={formData.partyName || ''}
                    onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Order Reference and Bill Number */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Link to Printing Order (Optional)
                  </label>
                  <select
                    value={formData.referenceOrderId || ''}
                    onChange={(e) => {
                      const orderId = e.target.value;
                      const order = orders.find((o) => o.orderId === orderId);
                      if (order) {
                        setFormData((prev) => ({
                          ...prev,
                          referenceOrderId: order.orderId,
                          partyName: order.customerName,
                          notes: `Order for ${order.workType} (${order.sizeDimensions})`,
                        }));
                      } else {
                        setFormData((prev) => ({ ...prev, referenceOrderId: '' }));
                      }
                    }}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="">-- No linked order --</option>
                    {orders.slice(0, 20).map((o) => (
                      <option key={o.id} value={o.orderId}>
                        {o.orderId} - {o.customerName} (₹{o.amount})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Invoice / Receipt Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-881, Bill #104"
                    value={formData.invoiceNumber || ''}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes / Particulars
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional details..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-xs transition-colors cursor-pointer ${
                    modalType === 'income'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {editingTxn ? 'Save Changes' : modalType === 'income' ? 'Save Income Entry' : 'Save Expense Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
