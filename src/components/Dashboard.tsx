import React from 'react';
import { OrderItem, WhatsAppLogEntry, ActiveTab } from '../types';
import {
  Users,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  IndianRupee,
  CreditCard,
  AlertCircle,
  MessageSquare,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  ArrowRight,
  Printer,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface DashboardProps {
  orders: OrderItem[];
  logs: WhatsAppLogEntry[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectOrderForReceipt: (order: OrderItem) => void;
  onQuickWhatsApp: (order: OrderItem) => void;
  onConfirmOrder?: (order: OrderItem) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  orders,
  logs,
  setActiveTab,
  onSelectOrderForReceipt,
  onQuickWhatsApp,
  onConfirmOrder,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Unique customers count
  const uniqueCustomerNames = new Set(orders.map((o) => o.customerName.trim().toLowerCase()));
  const totalCustomers = uniqueCustomerNames.size;
  const totalOrders = orders.length;

  const unconfirmedOrders = orders.filter(
    (o) => !o.adminConfirmed || o.orderStatus === 'Pending Confirmation'
  );

  const todayOrders = orders.filter((o) => o.dateTime.startsWith(todayStr)).length;
  const pendingOrders = orders.filter((o) =>
    ['Pending Confirmation', 'New', 'Design Pending', 'Designing', 'Customer Approval', 'Printing', 'Finishing'].includes(o.orderStatus)
  ).length;
  const readyOrders = orders.filter((o) => o.orderStatus === 'Ready').length;
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered').length;

  const totalSales = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const totalAdvance = orders.reduce((sum, o) => sum + (Number(o.advancePaid) || 0), 0);
  const totalBalance = orders.reduce((sum, o) => sum + (Number(o.balanceAmount) || 0), 0);

  const successfulLogs = logs.filter((l) => ['Sent', 'Delivered', 'Read'].includes(l.status)).length;

  // Work Type Distribution
  const workTypeCounts: Record<string, number> = {};
  orders.forEach((o) => {
    workTypeCounts[o.workType] = (workTypeCounts[o.workType] || 0) + 1;
  });
  const workTypeSorted = Object.entries(workTypeCounts).sort((a, b) => b[1] - a[1]);

  // Order Status Distribution
  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    statusCounts[o.orderStatus] = (statusCounts[o.orderStatus] || 0) + 1;
  });

  // Recent Orders (last 5)
  const recentOrders = [...orders].slice(-5).reverse();

  // Status badge styling helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending Confirmation':
        return 'bg-amber-100 text-amber-950 border-amber-400 font-extrabold ring-1 ring-amber-400';
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
      case 'New':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Design Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Designing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Customer Approval':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Printing':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Finishing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Ready':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      case 'Delivered':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Action */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>arya2 Operations Center • Admin Pramod Sagria (9938109624)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Order &amp; Customer Management Dashboard
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Live overview of printing orders, customer database records, outstanding balances, and WhatsApp Cloud API dispatches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('calendar')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-xs"
            title="Open delivery schedule calendar with drag & drop"
          >
            <Calendar className="w-4 h-4 text-emerald-300" />
            <span>Delivery Calendar</span>
          </button>

          <button
            id="dash-new-order-btn"
            onClick={() => setActiveTab('new_order')}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>+ Create New Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Unconfirmed Orders Notification Banner */}
      {unconfirmedOrders.length > 0 && (
        <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500 text-white rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-amber-950">
                  {unconfirmedOrders.length} Customer Order(s) Awaiting Admin Confirmation
                </h3>
                <p className="text-xs text-amber-800">
                  Orders submitted by customers require approval by Admin Pramod Sagria before production.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('work_orders')}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Manage in Work Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {unconfirmedOrders.slice(0, 3).map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-xl p-3 border border-amber-200 shadow-2xs flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="font-mono-code font-bold text-slate-900 text-xs">
                    {ord.orderId} • <span className="font-sans font-semibold">{ord.customerName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {ord.workType} (₹{ord.amount})
                  </div>
                </div>
                {onConfirmOrder && (
                  <button
                    type="button"
                    onClick={() => onConfirmOrder(ord)}
                    className="shrink-0 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold rounded-lg shadow-2xs cursor-pointer transition-transform active:scale-95"
                  >
                    ✓ Confirm
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Customers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>TOTAL CUSTOMERS</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono-code">
            {totalCustomers}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Unique records in DB</div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>TOTAL ORDERS</span>
            <ShoppingBag className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono-code">
            {totalOrders}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Today's: {todayOrders} orders
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>IN PRODUCTION</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 font-mono-code">
            {pendingOrders}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Design / Print / Finish</div>
        </div>

        {/* Ready Orders */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>READY FOR PICKUP</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 font-mono-code">
            {readyOrders}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Awaiting delivery</div>
        </div>

        {/* Delivered Orders */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>DELIVERED</span>
            <Truck className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-700 font-mono-code">
            {deliveredOrders}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Completed orders</div>
        </div>
      </div>

      {/* Financial KPIs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Sales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>GROSS SALES</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono-code">
            ₹{totalSales.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total revenue booked</div>
        </div>

        {/* Advance Received */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>ADVANCE COLLECTED</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-700 font-mono-code">
            ₹{totalAdvance.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalSales > 0 ? Math.round((totalAdvance / totalSales) * 100) : 0}% of gross sales
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold">
            <span>OUTSTANDING BALANCE</span>
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 font-mono-code">
            ₹{totalBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">To collect upon delivery</div>
        </div>

        {/* WhatsApp Sent */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>WHATSAPP MESSAGES</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-teal-700 font-mono-code">
            {successfulLogs}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Auto dispatched via Cloud API</div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Type Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Work Type Breakdown</h2>
            </div>
            <span className="text-xs text-slate-500">Distribution by category</span>
          </div>

          <div className="space-y-3">
            {workTypeSorted.slice(0, 6).map(([type, count]) => {
              const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-800">{type}</span>
                    <span className="text-slate-500 font-mono-code">
                      {count} orders ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Order Production Status</h2>
            </div>
            <span className="text-xs text-slate-500">Current workflow stages</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              'New',
              'Design Pending',
              'Designing',
              'Customer Approval',
              'Printing',
              'Finishing',
              'Ready',
              'Delivered',
              'Cancelled',
            ].map((status) => {
              const count = statusCounts[status] || 0;
              return (
                <div
                  key={status}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex flex-col justify-between"
                >
                  <span className="text-xs text-slate-600 font-medium truncate">{status}</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-lg font-black text-slate-900 font-mono-code">{count}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border ${getStatusBadge(
                        status
                      )}`}
                    >
                      {totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Customer Orders</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest jobs logged into ARYA SCREEN database
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('work_orders')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All in Work Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Work Type</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Delivery Date</th>
                <th className="py-3 px-4 min-w-[150px]">Handling Designer</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Balance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono-code font-bold text-slate-900">
                    {order.orderId}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{order.customerName}</div>
                    <div className="text-[11px] text-slate-500">{order.mobileNumber}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {order.workType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono-code">
                    {order.sizeDimensions || `${order.width}x${order.height}`}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {order.deliveryDate}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 border border-emerald-200">
                        {(order.designerOperator || 'D').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800 text-xs truncate max-w-[140px]" title={order.designerOperator}>
                        {order.designerOperator || 'Arya Team'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono-code font-semibold text-slate-900">
                    ₹{order.amount}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-code font-bold">
                    {order.balanceAmount > 0 ? (
                      <span className="text-rose-600">₹{order.balanceAmount}</span>
                    ) : (
                      <span className="text-emerald-600">Paid</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${getStatusBadge(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {(!order.adminConfirmed || order.orderStatus === 'Pending Confirmation') && onConfirmOrder && (
                        <button
                          type="button"
                          onClick={() => onConfirmOrder(order)}
                          title="Confirm this order as Admin Pramod Sagria"
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-black cursor-pointer shadow-2xs transition-transform active:scale-95"
                        >
                          ✓ Confirm
                        </button>
                      )}
                      <button
                        onClick={() => onSelectOrderForReceipt(order)}
                        title="Print Order Receipt"
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onQuickWhatsApp(order)}
                        title="Send / Resend WhatsApp Message"
                        className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
