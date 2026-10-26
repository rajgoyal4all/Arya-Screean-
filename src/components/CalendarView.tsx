import React, { useState, useMemo } from 'react';
import {
  OrderItem,
  OrderStatus,
  WorkType,
} from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  GripVertical,
  Plus,
  Eye,
  MessageSquare,
  Printer,
  X,
  ArrowRight,
  IndianRupee,
  RotateCcw,
  Sparkles,
  CalendarCheck2,
  User,
  Phone,
} from 'lucide-react';

interface CalendarViewProps {
  orders: OrderItem[];
  designers?: string[];
  onRescheduleOrder: (orderId: string, newDeliveryDate: string) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onOpenReceipt: (order: OrderItem) => void;
  onQuickWhatsApp: (order: OrderItem) => void;
  onSelectDateForNewOrder?: (dateStr: string) => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Format a date object to YYYY-MM-DD local string
const formatToYmd = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Normalize any order date string to YYYY-MM-DD
const normalizeOrderDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  // If format is like '2026-09-24' or '2026-09-24 14:30' or '2026-09-24T...'
  const trimmed = dateStr.trim();
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  // If format is DD/MM/YYYY or similar
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return formatToYmd(d);
  }
  return trimmed;
};

// Status styling mapping
const STATUS_CONFIG: Record<
  OrderStatus,
  { bg: string; text: string; border: string; dot: string; lightBg: string }
> = {
  'Pending Confirmation': {
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    border: 'border-amber-400',
    dot: 'bg-amber-500',
    lightBg: 'bg-amber-50/80',
  },
  Confirmed: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-900',
    border: 'border-emerald-400',
    dot: 'bg-emerald-500',
    lightBg: 'bg-emerald-50/70',
  },
  New: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-400',
    dot: 'bg-blue-500',
    lightBg: 'bg-blue-50/70',
  },
  'Design Pending': {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-400',
    dot: 'bg-amber-500',
    lightBg: 'bg-amber-50/70',
  },
  Designing: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-400',
    dot: 'bg-purple-500',
    lightBg: 'bg-purple-50/70',
  },
  'Customer Approval': {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-400',
    dot: 'bg-orange-500',
    lightBg: 'bg-orange-50/70',
  },
  Printing: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-400',
    dot: 'bg-indigo-500',
    lightBg: 'bg-indigo-50/70',
  },
  Finishing: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-800',
    border: 'border-cyan-400',
    dot: 'bg-cyan-500',
    lightBg: 'bg-cyan-50/70',
  },
  Ready: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-500',
    dot: 'bg-emerald-500',
    lightBg: 'bg-emerald-50/80',
  },
  Delivered: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-300',
    dot: 'bg-slate-400',
    lightBg: 'bg-slate-50',
  },
  Cancelled: {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    border: 'border-rose-300',
    dot: 'bg-rose-400',
    lightBg: 'bg-rose-50/50',
  },
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  orders,
  designers = [],
  onRescheduleOrder,
  onUpdateOrderStatus,
  onOpenReceipt,
  onQuickWhatsApp,
  onSelectDateForNewOrder,
}) => {
  // Today reference
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => formatToYmd(today), [today]);

  // Current calendar viewing month/year state
  const [currentYear, setCurrentYear] = useState<number>(() => today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => today.getMonth());

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [designerFilter, setDesignerFilter] = useState<string>('ALL');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // Drag and Drop state
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [lastRescheduled, setLastRescheduled] = useState<{
    orderId: string;
    customerName: string;
    prevDate: string;
    newDate: string;
  } | null>(null);

  // Detail Modal states
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [viewingDateOrders, setViewingDateOrders] = useState<{
    dateStr: string;
    formattedDate: string;
    orders: OrderItem[];
  } | null>(null);

  // Reschedule date picker inside modal
  const [modalNewDate, setModalNewDate] = useState('');

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Map orders by normalized delivery date
  const ordersByDate = useMemo(() => {
    const map = new Map<string, OrderItem[]>();
    for (const order of orders) {
      const d = normalizeOrderDate(order.deliveryDate);
      if (!d) continue;
      if (!map.has(d)) {
        map.set(d, []);
      }
      map.get(d)!.push(order);
    }
    return map;
  }, [orders]);

  // Filtered orders map based on active filters
  const filteredOrdersByDate = useMemo(() => {
    const map = new Map<string, OrderItem[]>();

    ordersByDate.forEach((dayOrders, dateStr) => {
      const filtered = dayOrders.filter((order) => {
        // Status filter
        if (statusFilter !== 'ALL' && order.orderStatus !== statusFilter) {
          return false;
        }

        // Designer filter
        if (designerFilter !== 'ALL' && order.designerOperator !== designerFilter) {
          return false;
        }

        // Overdue filter
        if (showOverdueOnly) {
          const isOverdue =
            dateStr < todayStr &&
            order.orderStatus !== 'Delivered' &&
            order.orderStatus !== 'Cancelled';
          if (!isOverdue) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = order.orderId.toLowerCase().includes(q);
          const matchCust = order.customerName.toLowerCase().includes(q);
          const matchWork = order.workType.toLowerCase().includes(q);
          const matchMobile = order.mobileNumber.includes(q);
          if (!matchId && !matchCust && !matchWork && !matchMobile) {
            return false;
          }
        }

        return true;
      });

      if (filtered.length > 0) {
        map.set(dateStr, filtered);
      }
    });

    return map;
  }, [ordersByDate, statusFilter, designerFilter, showOverdueOnly, searchQuery, todayStr]);

  // Month stats for the currently selected month
  const monthStats = useMemo(() => {
    let totalMonthOrders = 0;
    let readyCount = 0;
    let overdueCount = 0;
    let totalRevenue = 0;

    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    orders.forEach((order) => {
      const d = normalizeOrderDate(order.deliveryDate);
      if (d.startsWith(monthPrefix)) {
        totalMonthOrders++;
        totalRevenue += order.amount || 0;
        if (order.orderStatus === 'Ready') {
          readyCount++;
        }
      }

      // Check overdue regardless of month or for whole system
      if (
        d < todayStr &&
        order.orderStatus !== 'Delivered' &&
        order.orderStatus !== 'Cancelled'
      ) {
        overdueCount++;
      }
    });

    return { totalMonthOrders, readyCount, overdueCount, totalRevenue };
  }, [orders, currentYear, currentMonth, todayStr]);

  // Calendar Days Grid generation
  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    interface CalendarCell {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isPast: boolean;
      dayOrders: OrderItem[];
    }

    const cells: CalendarCell[] = [];

    // 1. Prev month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonthDate = new Date(currentYear, currentMonth - 1, dayNum);
      const dateStr = formatToYmd(prevMonthDate);
      cells.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        dayOrders: filteredOrdersByDate.get(dateStr) || [],
      });
    }

    // 2. Current month days
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const curDate = new Date(currentYear, currentMonth, dayNum);
      const dateStr = formatToYmd(curDate);
      cells.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        dayOrders: filteredOrdersByDate.get(dateStr) || [],
      });
    }

    // 3. Next month leading days to complete full weeks (multiples of 7, up to 35 or 42)
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const remaining = totalCells - cells.length;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextMonthDate = new Date(currentYear, currentMonth + 1, dayNum);
      const dateStr = formatToYmd(nextMonthDate);
      cells.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        dayOrders: filteredOrdersByDate.get(dateStr) || [],
      });
    }

    return cells;
  }, [currentYear, currentMonth, todayStr, filteredOrdersByDate]);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, order: OrderItem) => {
    e.dataTransfer.setData('text/plain', order.orderId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedOrderId(order.orderId);
  };

  const handleDragEnd = () => {
    setDraggedOrderId(null);
    setDragOverDate(null);
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDate !== dateStr) {
      setDragOverDate(dateStr);
    }
  };

  const handleDragLeave = (e: React.DragEvent, dateStr: string) => {
    // Only clear if leaving the cell itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverDate === dateStr) {
      setDragOverDate(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    setDragOverDate(null);
    const orderId = e.dataTransfer.getData('text/plain') || draggedOrderId;
    if (!orderId) return;

    const order = orders.find((o) => o.orderId === orderId);
    if (!order) return;

    const currentYmd = normalizeOrderDate(order.deliveryDate);
    if (currentYmd === targetDateStr) {
      // Same date, no reschedule needed
      return;
    }

    // Execute reschedule
    onRescheduleOrder(orderId, targetDateStr);
    setLastRescheduled({
      orderId: order.orderId,
      customerName: order.customerName,
      prevDate: currentYmd,
      newDate: targetDateStr,
    });
  };

  // Undo last reschedule
  const handleUndoReschedule = () => {
    if (!lastRescheduled) return;
    onRescheduleOrder(lastRescheduled.orderId, lastRescheduled.prevDate);
    setLastRescheduled(null);
  };

  // Open modal with order
  const handleOpenOrder = (order: OrderItem) => {
    setSelectedOrder(order);
    setModalNewDate(normalizeOrderDate(order.deliveryDate));
  };

  // Manual reschedule via modal
  const handleModalReschedule = () => {
    if (!selectedOrder || !modalNewDate) return;
    const currentYmd = normalizeOrderDate(selectedOrder.deliveryDate);
    if (currentYmd !== modalNewDate) {
      onRescheduleOrder(selectedOrder.orderId, modalNewDate);
      setSelectedOrder((prev) => (prev ? { ...prev, deliveryDate: modalNewDate } : null));
    }
  };

  // Open day orders drawer
  const handleOpenDateDetails = (dateStr: string, dayOrders: OrderItem[]) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const formatted = dateObj.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    setViewingDateOrders({
      dateStr,
      formattedDate: formatted,
      orders: dayOrders,
    });
  };

  // Year choices for quick dropdown
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="space-y-4">
      {/* Top Banner / Undo Notification */}
      {lastRescheduled && (
        <div className="bg-emerald-900/90 text-white px-4 py-2.5 rounded-lg flex items-center justify-between shadow-md border border-emerald-700 animate-fadeIn">
          <div className="flex items-center gap-2.5 text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>
              Rescheduled <strong>{lastRescheduled.orderId}</strong> (
              {lastRescheduled.customerName}) to{' '}
              <span className="underline decoration-emerald-400 font-bold">
                {lastRescheduled.newDate}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndoReschedule}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Undo
            </button>
            <button
              onClick={() => setLastRescheduled(null)}
              className="text-white/70 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Calendar Header Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        {/* Row 1: Month Nav, Today button, and Action Summary */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white hover:shadow-xs rounded-md text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleGoToToday}
                className="px-3 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white hover:shadow-xs rounded-md transition-all cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white hover:shadow-xs rounded-md text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Month & Year Title with Dropdowns */}
            <div className="flex items-center gap-2">
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="text-lg sm:text-xl font-bold text-slate-900 bg-transparent border-0 font-display focus:ring-2 focus:ring-emerald-500 rounded px-1 cursor-pointer"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="text-lg sm:text-xl font-bold text-slate-900 bg-transparent border-0 font-display focus:ring-2 focus:ring-emerald-500 rounded px-1 cursor-pointer"
              >
                {yearOptions.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              <GripVertical className="w-3.5 h-3.5 text-slate-400" />
              Drag &amp; drop cards to reschedule
            </span>
          </div>

          {/* Quick Month Metrics */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
              <CalendarCheck2 className="w-4 h-4 text-slate-600" />
              <div>
                <span className="text-slate-500 block text-[10px] font-medium uppercase">Due In Month</span>
                <span className="font-bold text-slate-800">{monthStats.totalMonthOrders} orders</span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-emerald-600 block text-[10px] font-medium uppercase">Ready For Pickup</span>
                <span className="font-bold text-emerald-800">{monthStats.readyCount}</span>
              </div>
            </div>

            {monthStats.overdueCount > 0 && (
              <button
                type="button"
                onClick={() => setShowOverdueOnly(!showOverdueOnly)}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-all border ${
                  showOverdueOnly
                    ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                    : 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                }`}
                title="Click to toggle overdue orders filter"
              >
                <AlertTriangle className={`w-4 h-4 ${showOverdueOnly ? 'text-white' : 'text-rose-600 animate-bounce'}`} />
                <div className="text-left">
                  <span className={`block text-[10px] font-medium uppercase ${showOverdueOnly ? 'text-rose-100' : 'text-rose-600'}`}>
                    Overdue Warning
                  </span>
                  <span className="font-bold">{monthStats.overdueCount} orders</span>
                </div>
              </button>
            )}

            <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-blue-600" />
              <div>
                <span className="text-blue-600 block text-[10px] font-medium uppercase">Total Value</span>
                <span className="font-bold text-blue-900">₹{monthStats.totalRevenue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Search, Filters & Status Guide */}
        <div className="mt-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order ID, customer..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ×
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="New">New</option>
                <option value="Design Pending">Design Pending</option>
                <option value="Designing">Designing</option>
                <option value="Customer Approval">Customer Approval</option>
                <option value="Printing">Printing</option>
                <option value="Finishing">Finishing</option>
                <option value="Ready">Ready</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Designer Filter */}
            {designers.length > 0 && (
              <select
                value={designerFilter}
                onChange={(e) => setDesignerFilter(e.target.value)}
                className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Designers</option>
                {designers.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}

            {/* Clear filters shortcut */}
            {(statusFilter !== 'ALL' || designerFilter !== 'ALL' || searchQuery || showOverdueOnly) && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('ALL');
                  setDesignerFilter('ALL');
                  setSearchQuery('');
                  setShowOverdueOnly(false);
                }}
                className="text-xs text-emerald-700 hover:underline font-medium px-1 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Mini Status Legend */}
          <div className="hidden xl:flex items-center gap-3 text-[11px] text-slate-600 bg-slate-50/80 px-2.5 py-1 rounded-md border border-slate-200/60">
            <span className="font-semibold text-slate-500">Legend:</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Ready
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Printing
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span> Designing
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span> Delivered
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Calendar Grid */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider text-center">
          {WEEKDAY_NAMES.map((day, idx) => (
            <div
              key={day}
              className={`py-2.5 border-r border-slate-200 last:border-r-0 ${
                idx === 0 ? 'text-rose-600' : idx === 6 ? 'text-blue-600' : ''
              }`}
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 gap-[1px]">
          {calendarGrid.map((cell) => {
            const isDragTarget = dragOverDate === cell.dateStr;
            const hasOrders = cell.dayOrders.length > 0;
            const maxVisible = 3;
            const visibleOrders = cell.dayOrders.slice(0, maxVisible);
            const extraCount = cell.dayOrders.length - maxVisible;

            return (
              <div
                key={cell.dateStr}
                onDragOver={(e) => handleDragOver(e, cell.dateStr)}
                onDragLeave={(e) => handleDragLeave(e, cell.dateStr)}
                onDrop={(e) => handleDrop(e, cell.dateStr)}
                className={`min-h-[115px] sm:min-h-[135px] p-1.5 sm:p-2 flex flex-col transition-all duration-150 relative ${
                  cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/70 text-slate-400'
                } ${cell.isToday ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-50/20' : ''} ${
                  isDragTarget
                    ? 'bg-emerald-100/90 ring-2 ring-emerald-600 ring-inset z-10 shadow-inner'
                    : ''
                }`}
              >
                {/* Cell Header: Date number & daily count */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-transform ${
                        cell.isToday
                          ? 'bg-emerald-600 text-white shadow-xs font-black scale-105'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {cell.isToday && (
                      <span className="hidden md:inline text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {hasOrders && (
                      <button
                        type="button"
                        onClick={() => handleOpenDateDetails(cell.dateStr, cell.dayOrders)}
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title={`${cell.dayOrders.length} orders on this date`}
                      >
                        {cell.dayOrders.length}
                      </button>
                    )}

                    {/* Quick Add Order button on hover */}
                    {onSelectDateForNewOrder && cell.isCurrentMonth && (
                      <button
                        type="button"
                        onClick={() => onSelectDateForNewOrder(cell.dateStr)}
                        className="opacity-0 hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-emerald-700 p-0.5 rounded hover:bg-slate-100 transition-opacity cursor-pointer"
                        title={`Create new order scheduled for ${cell.dateStr}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Drop cue banner when dragging over */}
                {isDragTarget && (
                  <div className="bg-emerald-600 text-white text-[10px] font-bold text-center py-1 rounded shadow-xs mb-1 animate-pulse">
                    Drop to Reschedule here
                  </div>
                )}

                {/* Orders list in day cell */}
                <div className="flex-1 space-y-1 overflow-hidden">
                  {visibleOrders.map((order) => {
                    const statusInfo = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.New;
                    const isOverdue =
                      cell.isPast &&
                      order.orderStatus !== 'Delivered' &&
                      order.orderStatus !== 'Cancelled';
                    const isThisBeingDragged = draggedOrderId === order.orderId;

                    return (
                      <div
                        key={order.id || order.orderId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, order)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleOpenOrder(order)}
                        className={`group border rounded p-1 sm:p-1.5 text-left text-xs transition-all cursor-grab active:cursor-grabbing hover:shadow-sm select-none ${
                          statusInfo.lightBg
                        } ${isOverdue ? 'border-rose-400 ring-1 ring-rose-400/30' : statusInfo.border} ${
                          isThisBeingDragged ? 'opacity-40 scale-95 border-dashed' : ''
                        }`}
                        title="Click to view details or drag to reschedule"
                      >
                        <div className="flex items-center justify-between gap-1 leading-none">
                          <div className="flex items-center gap-1 min-w-0">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusInfo.dot}`} />
                            <span className="font-mono-code font-bold text-[10px] text-slate-800 truncate">
                              {order.orderId.replace('ARYA-2026-', '')}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-semibold px-1 rounded truncate shrink-0 ${
                              isOverdue
                                ? 'bg-rose-500 text-white'
                                : `${statusInfo.bg} ${statusInfo.text}`
                            }`}
                          >
                            {isOverdue ? 'OVERDUE' : order.orderStatus}
                          </span>
                        </div>

                        <div className="mt-0.5 text-[10px] font-medium text-slate-700 truncate leading-tight">
                          {order.customerName}
                        </div>

                        <div className="mt-0.5 flex items-center justify-between text-[9px] text-slate-500">
                          <span className="truncate max-w-[70px] text-slate-600">{order.workType}</span>
                          <span className="font-semibold text-slate-800">₹{order.amount}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* More orders indicator */}
                  {extraCount > 0 && (
                    <button
                      type="button"
                      onClick={() => handleOpenDateDetails(cell.dateStr, cell.dayOrders)}
                      className="w-full text-center py-0.5 text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50/60 hover:bg-emerald-100 rounded border border-emerald-200/60 cursor-pointer transition-colors"
                    >
                      +{extraCount} more order{extraCount > 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Detail Modal: When user clicks a day with multiple orders */}
      {viewingDateOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-emerald-400 font-mono-code font-bold">
                  Daily Delivery Schedule
                </div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-emerald-400" />
                  {viewingDateOrders.formattedDate}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingDateOrders(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Orders */}
            <div className="p-6 overflow-y-auto space-y-3 divide-y divide-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
                <span>
                  Total Scheduled: <strong>{viewingDateOrders.orders.length} orders</strong>
                </span>
                <span>
                  Total Value:{' '}
                  <strong className="text-slate-800">
                    ₹
                    {viewingDateOrders.orders
                      .reduce((sum, o) => sum + (o.amount || 0), 0)
                      .toLocaleString('en-IN')}
                  </strong>
                </span>
              </div>

              {viewingDateOrders.orders.map((order) => {
                const statusInfo = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.New;
                return (
                  <div
                    key={order.orderId}
                    className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${statusInfo.dot}`} />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono-code font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {order.orderId}
                          </span>
                          <span className="font-bold text-sm text-slate-800">
                            {order.customerName}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusInfo.bg} ${statusInfo.text}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>{order.workType}</span>
                          <span>•</span>
                          <span>{order.sizeDimensions || `${order.width}x${order.height} ft`}</span>
                          <span>•</span>
                          <span>Operator: {order.designerOperator.split('(')[0].trim()}</span>
                          {order.balanceAmount > 0 ? (
                            <span className="text-amber-600 font-semibold">
                              Bal: ₹{order.balanceAmount}
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-semibold">Fully Paid</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          handleOpenOrder(order);
                          setViewingDateOrders(null);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details / Move
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              {onSelectDateForNewOrder && (
                <button
                  type="button"
                  onClick={() => {
                    const date = viewingDateOrders.dateStr;
                    setViewingDateOrders(null);
                    onSelectDateForNewOrder(date);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Order for this Date
                </button>
              )}
              <button
                type="button"
                onClick={() => setViewingDateOrders(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Order Detail & Reschedule Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono-code uppercase tracking-wider text-emerald-400 font-bold">
                  Order Details &amp; Reschedule
                </span>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {selectedOrder.orderId}
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      STATUS_CONFIG[selectedOrder.orderStatus]?.bg || 'bg-slate-100'
                    } ${STATUS_CONFIG[selectedOrder.orderStatus]?.text || 'text-slate-800'}`}
                  >
                    {selectedOrder.orderStatus}
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Customer summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <User className="w-4 h-4 text-slate-500" />
                    {selectedOrder.customerName}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono-code">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {selectedOrder.mobileNumber}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Work Type</span>
                    <span className="font-semibold text-slate-800">{selectedOrder.workType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Dimensions / Material</span>
                    <span className="font-medium text-slate-800">
                      {selectedOrder.sizeDimensions || `${selectedOrder.width}x${selectedOrder.height} ft`}
                      {selectedOrder.material ? ` (${selectedOrder.material})` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Total / Balance</span>
                    <span className="font-bold text-slate-900">
                      ₹{selectedOrder.amount}{' '}
                      {selectedOrder.balanceAmount > 0 ? (
                        <span className="text-rose-600 font-normal">
                          (Bal ₹{selectedOrder.balanceAmount})
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-normal">(Paid)</span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Assigned Designer</span>
                    <span className="font-medium text-slate-800">
                      {selectedOrder.designerOperator.split('(')[0].trim()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reschedule Date Section */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1.5 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-emerald-700" />
                  Delivery Date (Reschedule)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={modalNewDate}
                    onChange={(e) => setModalNewDate(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleModalReschedule}
                    disabled={!modalNewDate || modalNewDate === normalizeOrderDate(selectedOrder.deliveryDate)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
                  >
                    Save Date
                  </button>
                </div>
                <p className="text-[11px] text-emerald-700 mt-1.5">
                  Current schedule: <strong>{selectedOrder.deliveryDate}</strong>. You can also drag and drop order cards directly on the monthly calendar!
                </p>
              </div>

              {/* Status Updater */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Change Production Status
                </label>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => {
                    const nextStatus = e.target.value as OrderStatus;
                    onUpdateOrderStatus(selectedOrder.orderId, nextStatus);
                    setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: nextStatus } : null));
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="New">New</option>
                  <option value="Design Pending">Design Pending</option>
                  <option value="Designing">Designing</option>
                  <option value="Customer Approval">Customer Approval</option>
                  <option value="Printing">Printing</option>
                  <option value="Finishing">Finishing</option>
                  <option value="Ready">Ready for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Footer with actions */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onOpenReceipt(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Job Slip
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onQuickWhatsApp(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  WhatsApp
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
