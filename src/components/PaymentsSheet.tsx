import React, { useState } from 'react';
import { OrderItem, PaymentMethod } from '../types';
import {
  IndianRupee,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Download,
  PlusCircle,
  Printer,
  X,
  Trash2,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface PaymentsSheetProps {
  orders: OrderItem[];
  onUpdatePayment: (orderId: string, additionalAmount: number, method: PaymentMethod) => void;
  onOpenReceipt: (order: OrderItem) => void;
  onDeleteOrder: (order: OrderItem) => void;
}

export const PaymentsSheet: React.FC<PaymentsSheetProps> = ({
  orders,
  onUpdatePayment,
  onOpenReceipt,
  onDeleteOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'Paid' | 'Partial' | 'Pending'>('ALL');
  const [collectModalOrder, setCollectModalOrder] = useState<OrderItem | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectMethod, setCollectMethod] = useState<PaymentMethod>('Cash');

  const totalSales = orders.reduce((sum, o) => sum + o.amount, 0);
  const totalAdvance = orders.reduce((sum, o) => sum + o.advancePaid, 0);
  const totalBalance = orders.reduce((sum, o) => sum + o.balanceAmount, 0);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      searchTerm === '' ||
      o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.mobileNumber.includes(searchTerm);

    const matchesFilter =
      paymentFilter === 'ALL' || o.paymentStatus === paymentFilter;

    return matchesSearch && matchesFilter;
  });

  const openCollectModal = (order: OrderItem) => {
    setCollectModalOrder(order);
    setCollectAmount(order.balanceAmount);
  };

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectModalOrder) return;
    if (collectAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    onUpdatePayment(collectModalOrder.orderId, collectAmount, collectMethod);
    setCollectModalOrder(null);
  };

  const exportPaymentsSheet = () => {
    const data = filteredOrders.map((o) => ({
      'Order ID': o.orderId,
      'Customer Name': o.customerName,
      'Mobile': o.mobileNumber,
      'Work Type': o.workType,
      'Total Amount (₹)': o.amount,
      'Advance Paid (₹)': o.advancePaid,
      'Balance Due (₹)': o.balanceAmount,
      'Payment Status': o.paymentStatus,
      'Payment Method': o.paymentMethod,
      'Delivery Date': o.deliveryDate,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PAYMENTS LEDGER');
    XLSX.writeFile(wb, `ARYA_SCREEN_PAYMENTS_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Payments & Accounts Sheet
            </h1>
            <p className="text-xs text-slate-500">
              Track customer advances, cash/UPI receipts, and collect pending balances upon job delivery
            </p>
          </div>
        </div>

        <button
          onClick={exportPaymentsSheet}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Payments (.xlsx)</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>GROSS BILLED AMOUNT</span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black font-mono-code text-slate-900">
            ₹{totalSales.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total revenue across all jobs</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>TOTAL COLLECTED (ADVANCE + BALANCE)</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black font-mono-code text-emerald-700">
            ₹{totalAdvance.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {totalSales > 0 ? Math.round((totalAdvance / totalSales) * 100) : 0}% collected
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-700">
            <span>TOTAL PENDING BALANCE</span>
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black font-mono-code text-rose-600">
            ₹{totalBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">To collect before handover</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Order ID, Customer Name, Mobile..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white outline-none w-full sm:w-auto"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="Paid">Fully Paid Only</option>
            <option value="Partial">Partial / Advance Paid</option>
            <option value="Pending">Payment Pending</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300 sticky top-0 z-10 select-none text-[11px]">
              <tr className="divide-x divide-slate-200">
                <th className="py-2.5 px-3 whitespace-nowrap bg-slate-100">#</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Order ID</th>
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[170px]">Customer Name</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Mobile</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Work Type</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Total Amount (₹)</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Advance Paid (₹)</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Balance Due (₹)</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">Status</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Payment Method</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center bg-slate-100">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord, idx) => (
                  <tr
                    key={ord.id}
                    className="hover:bg-slate-50/80 divide-x divide-slate-100 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono-code text-slate-400 bg-slate-50/50 text-center">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono-code font-bold text-slate-900 whitespace-nowrap">
                      {ord.orderId}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {ord.customerName}
                    </td>
                    <td className="py-2.5 px-3 font-mono-code text-slate-700 whitespace-nowrap">
                      {ord.mobileNumber}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-700">
                      {ord.workType}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-code font-bold text-slate-900">
                      ₹{ord.amount}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-code font-bold text-emerald-700">
                      ₹{ord.advancePaid}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-code font-bold">
                      {ord.balanceAmount > 0 ? (
                        <span className="text-rose-600">₹{ord.balanceAmount}</span>
                      ) : (
                        <span className="text-emerald-600">₹0 (Paid)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          ord.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.paymentStatus === 'Partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {ord.paymentMethod}
                    </td>
                    <td className="py-2.5 px-3 text-center bg-slate-50/50 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {ord.balanceAmount > 0 && (
                          <button
                            onClick={() => openCollectModal(ord)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold cursor-pointer"
                            title="Collect Remaining Balance"
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>Collect</span>
                          </button>
                        )}
                        <button
                          onClick={() => onOpenReceipt(ord)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded cursor-pointer"
                          title="Print Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteOrder(ord)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                          title="Remove / Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Balance Modal */}
      {collectModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Collect Payment Balance
                </h3>
                <p className="text-xs text-slate-500 font-mono-code">
                  Order: {collectModalOrder.orderId} • {collectModalOrder.customerName}
                </p>
              </div>
              <button
                onClick={() => setCollectModalOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectSubmit} className="space-y-4 mt-4">
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Job Amount:</span>
                  <span className="font-bold">₹{collectModalOrder.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Previously Paid:</span>
                  <span className="font-bold text-emerald-700">₹{collectModalOrder.advancePaid}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="font-bold text-slate-800">Remaining Balance:</span>
                  <span className="font-bold text-rose-600">₹{collectModalOrder.balanceAmount}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Amount Received Now (₹)
                </label>
                <input
                  type="number"
                  min={1}
                  max={collectModalOrder.balanceAmount}
                  required
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-lg font-black font-mono-code outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Payment Mode
                </label>
                <select
                  value={collectMethod}
                  onChange={(e) => setCollectMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold outline-none bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI / GPay / PhonePe">UPI / GPay / PhonePe</option>
                  <option value="Debit / Credit Card">Debit / Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCollectModalOrder(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm cursor-pointer"
                >
                  Record Payment Received
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
