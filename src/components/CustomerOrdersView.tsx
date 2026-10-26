import React, { useState } from 'react';
import { OrderItem, AuthUser, ShopProfile } from '../types';
import {
  ClipboardList,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  MessageSquare,
  Search,
  Sparkles,
  ArrowRight,
  PlusCircle,
  IndianRupee,
  Layers,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Phone,
  ShieldCheck,
  Send,
  Smartphone,
} from 'lucide-react';
import {
  getDirectWhatsAppUrl,
  getDirectSmsUrl,
  getAdminOrderWhatsAppUrl,
  getAdminOrderSmsUrl,
} from '../utils/whatsapp';

interface CustomerOrdersViewProps {
  currentUser: AuthUser | null;
  orders: OrderItem[];
  shopProfile: ShopProfile;
  onViewReceipt: (order: OrderItem) => void;
  onNavigateToSamples: () => void;
  onNavigateToNewOrder: () => void;
  onRequestLogin?: () => void;
}

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({
  currentUser,
  orders,
  shopProfile,
  onViewReceipt,
  onNavigateToSamples,
  onNavigateToNewOrder,
  onRequestLogin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  if (!currentUser) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <ClipboardList className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-black text-slate-900">
          Customer Login Required to View Orders
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Please log in with your verified mobile number and OTP to view your previous orders, live production stages, and delivery tracking.
        </p>
        <button
          onClick={onRequestLogin}
          className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <span>Login with Mobile &amp; OTP</span>
        </button>
      </div>
    );
  }

  // Filter orders strictly for this customer's mobile number
  const cleanUserPhone = currentUser.mobileNumber.replace(/\D/g, '');
  const myOrders = orders.filter((o) => {
    const oMobile = o.mobileNumber.replace(/\D/g, '');
    const oWhatsapp = o.whatsappNumber.replace(/\D/g, '');
    return (
      oMobile === cleanUserPhone ||
      oWhatsapp === cleanUserPhone ||
      (cleanUserPhone.length >= 8 && oMobile.endsWith(cleanUserPhone)) ||
      (cleanUserPhone.length >= 8 && cleanUserPhone.endsWith(oMobile))
    );
  });

  const filteredOrders = myOrders.filter((ord) => {
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'In Production' &&
        ['New', 'Designing', 'Design Pending', 'Customer Approval', 'Printing', 'Finishing'].includes(
          ord.orderStatus
        )) ||
      (statusFilter === 'Ready' && ord.orderStatus === 'Ready') ||
      (statusFilter === 'Delivered' && ord.orderStatus === 'Delivered');

    const q = searchTerm.toLowerCase().trim();
    if (!q) return matchesStatus;

    return (
      matchesStatus &&
      (ord.orderId.toLowerCase().includes(q) ||
        ord.workType.toLowerCase().includes(q) ||
        ord.workDescription.toLowerCase().includes(q) ||
        ord.sizeDimensions?.toLowerCase().includes(q))
    );
  });

  // Calculate metrics
  const totalOrders = myOrders.length;
  const inProductionCount = myOrders.filter((o) =>
    ['New', 'Designing', 'Design Pending', 'Customer Approval', 'Printing', 'Finishing'].includes(
      o.orderStatus
    )
  ).length;
  const readyCount = myOrders.filter((o) => o.orderStatus === 'Ready').length;
  const totalBalanceDue = myOrders.reduce((sum, o) => sum + (o.balanceAmount || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Confirmation':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'Confirmed':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      case 'Ready':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Delivered':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'Printing':
      case 'Finishing':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Designing':
      case 'Customer Approval':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getStepProgressIndex = (status: string) => {
    switch (status) {
      case 'Pending Confirmation':
        return 1;
      case 'Confirmed':
      case 'New':
        return 1;
      case 'Design Pending':
      case 'Designing':
      case 'Customer Approval':
        return 2;
      case 'Printing':
      case 'Finishing':
        return 3;
      case 'Ready':
        return 4;
      case 'Delivered':
        return 5;
      default:
        return 1;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Customer Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Customer Portal • arya2</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {currentUser.name}!
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Track your work orders, delivery schedule, download job receipts, or explore our latest design samples for Flex, All Print works, Polymer Stamp, and Online services.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToSamples}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-bold border border-white/20 transition-all cursor-pointer shadow-sm"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>View Design Samples</span>
            </button>

            <button
              onClick={onNavigateToNewOrder}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/25"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Place New Order</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Chips */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Orders
            </div>
            <div className="text-2xl font-black font-mono-code text-white mt-0.5">
              {totalOrders}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              In Production
            </div>
            <div className="text-2xl font-black font-mono-code text-amber-400 mt-0.5">
              {inProductionCount}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Ready for Pickup
            </div>
            <div className="text-2xl font-black font-mono-code text-emerald-400 mt-0.5">
              {readyCount}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Balance Due
            </div>
            <div
              className={`text-2xl font-black font-mono-code mt-0.5 ${
                totalBalanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              ₹{totalBalanceDue}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID or Work title..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'In Production', 'Ready', 'Delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <ClipboardList className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              No orders found for this filter
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {myOrders.length === 0
                ? `No past orders recorded under mobile +91 ${currentUser.mobileNumber}. Place your first order today or browse our design catalog!`
                : 'Try adjusting your search keywords or filter status above.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onNavigateToSamples}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Explore Design Samples
            </button>
            <button
              onClick={onNavigateToNewOrder}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              + Place Work Order
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const step = getStepProgressIndex(order.orderStatus);
            const whatsappMsg = `Hello arya2, I am inquiring about my order *${order.orderId}* (${order.workType}).`;
            const whatsappShopUrl = getDirectWhatsAppUrl('9938109624', whatsappMsg);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono-code font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {order.orderId}
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-mono-code">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Booked: {order.dateTime.split(' ')[0]}
                    </span>
                    <span className="flex items-center gap-1 font-mono-code font-bold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      Delivery: {order.deliveryDate || 'Standard'}
                    </span>
                  </div>
                </div>

                {/* Job Details & Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <h3 className="font-black text-slate-900 text-base">
                      {order.workType}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {order.workDescription || 'Custom printing & design order.'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                      {order.sizeDimensions && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-mono-code font-semibold">
                          Size: {order.sizeDimensions}
                        </span>
                      )}
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-mono-code font-semibold">
                        Qty: {order.quantity}
                      </span>
                      {order.material && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                          Material: {order.material}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 text-xs space-y-1 font-mono-code">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Amount:</span>
                      <span className="font-bold text-slate-900">₹{order.amount}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Advance Paid:</span>
                      <span className="font-bold">₹{order.advancePaid}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 font-extrabold text-sm">
                      <span className="text-slate-800">Balance Due:</span>
                      <span
                        className={
                          order.balanceAmount > 0
                            ? 'text-rose-600'
                            : 'text-emerald-700'
                        }
                      >
                        ₹{order.balanceAmount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Admin Confirmation Status Banner */}
                {!order.adminConfirmed ? (
                  <div className="p-3.5 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl text-xs text-amber-950 space-y-2.5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-extrabold text-amber-950 text-xs">
                          ⏳ Waiting for Admin Confirmation
                        </span>
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                          Pending Admin Review
                        </span>
                      </div>
                      <span className="text-[11px] text-amber-900 font-mono-code font-bold">
                        Admin: Pramod Sagria (9938109624)
                      </span>
                    </div>

                    <p className="text-[11px] text-amber-900 leading-relaxed">
                      Order details must be delivered to Admin Pramod Sagria on mobile <strong>9938109624</strong>. Click below to deliver directly to Admin via WhatsApp or SMS:
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={getAdminOrderWhatsAppUrl(order)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>🚀 Deliver Order to Admin WhatsApp (9938109624)</span>
                      </a>

                      <a
                        href={getAdminOrderSmsUrl(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-all"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                        <span>📱 Send SMS to Admin Mobile (9938109624)</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold">
                        ✅ Confirmed by Admin: Pramod Sagria (9938109624)
                      </span>
                    </div>
                    {order.confirmedAt && (
                      <span className="text-[11px] text-emerald-800 font-mono-code bg-emerald-100/70 px-2 py-0.5 rounded">
                        Confirmed: {order.confirmedAt.split('T')[0]}
                      </span>
                    )}
                  </div>
                )}

                {/* 5-Step Visual Progress Bar */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Production Progress
                  </div>
                  <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs">
                    {[
                      { idx: 1, label: order.adminConfirmed ? 'Confirmed' : 'Order Placed' },
                      { idx: 2, label: 'Designing' },
                      { idx: 3, label: 'Printing' },
                      { idx: 4, label: 'Ready' },
                      { idx: 5, label: 'Delivered' },
                    ].map((s) => {
                      const isComplete = step >= s.idx;
                      const isCurrent = step === s.idx;
                      return (
                        <div key={s.idx} className="space-y-1">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isComplete
                                ? 'bg-emerald-600'
                                : 'bg-slate-200'
                            } ${isCurrent ? 'ring-2 ring-emerald-600/30' : ''}`}
                          />
                          <span
                            className={`block truncate font-semibold ${
                              isComplete
                                ? 'text-emerald-950 font-bold'
                                : 'text-slate-400'
                            }`}
                          >
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    Need revisions or urgent delivery? Contact <strong className="text-slate-800 font-bold">Pramod Sagria (arya2)</strong> on <span className="font-mono-code font-bold text-slate-900">9938109624</span>.
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => onViewReceipt(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Receipt</span>
                    </button>

                    <a
                      href={getDirectSmsUrl('9938109624', `Hi Pramod ji (arya2), inquiry for order ${order.orderId}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-300" />
                      <span>SMS Admin (9938109624)</span>
                    </a>

                    <a
                      href={whatsappShopUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Admin (9938109624)</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
