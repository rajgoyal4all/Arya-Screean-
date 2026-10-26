import React, { useState } from 'react';
import { OrderItem } from '../types';
import {
  Search as SearchIcon,
  Printer,
  MessageSquare,
  Calendar,
  Phone,
  MapPin,
  Clock,
  Layers,
  IndianRupee,
  FileCheck,
  CheckCircle,
  Trash2,
} from 'lucide-react';

interface SearchSystemProps {
  orders: OrderItem[];
  onOpenReceipt: (order: OrderItem) => void;
  onQuickWhatsApp: (order: OrderItem) => void;
  onDeleteOrder: (order: OrderItem) => void;
}

export const SearchSystem: React.FC<SearchSystemProps> = ({
  orders,
  onOpenReceipt,
  onQuickWhatsApp,
  onDeleteOrder,
}) => {
  const [query, setQuery] = useState('');
  const [searchField, setSearchField] = useState<'ALL' | 'NAME' | 'MOBILE' | 'ORDER_ID' | 'WORK_TYPE' | 'DATE'>('ALL');

  const filteredOrders = orders.filter((o) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase().trim();

    if (searchField === 'NAME') {
      return o.customerName.toLowerCase().includes(q);
    }
    if (searchField === 'MOBILE') {
      return o.mobileNumber.includes(q) || o.whatsappNumber.includes(q);
    }
    if (searchField === 'ORDER_ID') {
      return o.orderId.toLowerCase().includes(q) || o.customerId.toLowerCase().includes(q);
    }
    if (searchField === 'WORK_TYPE') {
      return o.workType.toLowerCase().includes(q);
    }
    if (searchField === 'DATE') {
      return o.dateTime.includes(q) || o.deliveryDate.includes(q);
    }

    // Default 'ALL'
    return (
      o.customerName.toLowerCase().includes(q) ||
      o.mobileNumber.includes(q) ||
      o.whatsappNumber.includes(q) ||
      o.orderId.toLowerCase().includes(q) ||
      o.customerId.toLowerCase().includes(q) ||
      o.workType.toLowerCase().includes(q) ||
      o.dateTime.includes(q) ||
      o.deliveryDate.includes(q) ||
      o.villageTown.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <SearchIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Arya Screen Order & Customer Search System
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant search across Customer Name, Mobile Number, Order ID, Work Type, or Date
            </p>
          </div>
        </div>

        {/* Search Input Bar with Filter Mode */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type customer name, 10-digit mobile, ARYA-2026-0001, date (YYYY-MM-DD)..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none font-medium"
              autoFocus
            />
          </div>

          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as any)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="ALL">All Fields</option>
            <option value="NAME">Customer Name</option>
            <option value="MOBILE">Mobile Number</option>
            <option value="ORDER_ID">Order ID</option>
            <option value="WORK_TYPE">Work Type</option>
            <option value="DATE">Order / Delivery Date</option>
          </select>
        </div>

        {/* Quick Suggestion Tags */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium">Quick suggestions:</span>
          {['Radhey Sweets', 'Gupta', 'Flex', 'Visiting Card', 'ARYA-2026', '9837'].map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono-code text-[11px] cursor-pointer transition-colors"
            >
              {tag}
            </button>
          ))}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-rose-600 hover:underline font-semibold ml-auto cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Search Results Display */}
      {query.trim() === '' ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <SearchIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Enter a search query above</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Search by Customer Name, Mobile Number, Order ID (e.g. ARYA-2026-0001), Work Type, or Delivery Date to view complete customer and job records.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-3">
            <SearchIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No records found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No customer or order matched <span className="font-semibold text-slate-900">"{query}"</span>.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-500 px-1">
            FOUND {filteredOrders.length} MATCHING {filteredOrders.length === 1 ? 'RECORD' : 'RECORDS'}
          </div>

          {filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-emerald-300 transition-all"
            >
              {/* Card Top: Order ID & Status */}
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-base font-black font-mono-code text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                    {ord.orderId}
                  </span>
                  <span className="text-xs text-slate-500 font-mono-code">
                    Cust ID: {ord.customerId}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Booked: {ord.dateTime}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Status: {ord.orderStatus}
                  </span>
                </div>
              </div>

              {/* Card Body: 3-column Information Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4 text-xs">
                {/* 1. Customer Info */}
                <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    CUSTOMER PROFILE
                  </div>
                  <div className="font-bold text-sm text-slate-900">{ord.customerName}</div>
                  <div className="flex items-center gap-1.5 text-slate-700 font-mono-code">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>+91 {ord.mobileNumber}</span>
                  </div>
                  {ord.address && (
                    <div className="flex items-start gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        {ord.address}, {ord.villageTown}, {ord.district} - {ord.pincode}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Job / Work Specifications */}
                <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    JOB SPECIFICATIONS
                  </div>
                  <div className="font-bold text-sm text-emerald-800">
                    {ord.workType}
                  </div>
                  <div className="text-slate-700 font-medium">{ord.workDescription}</div>
                  <div className="text-slate-600 font-mono-code">
                    Dimensions: {ord.sizeDimensions} • Qty: {ord.quantity}
                  </div>
                  <div className="text-slate-500">
                    Material: {ord.material || 'Standard'}
                  </div>
                  {ord.designFileName && (
                    <div className="text-slate-600 font-mono-code text-[11px]">
                      File: {ord.designFileName}
                    </div>
                  )}
                  <div className="text-emerald-700 font-semibold pt-1">
                    Delivery: {ord.deliveryDate}
                  </div>
                </div>

                {/* 3. Payment & Assignment */}
                <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      PAYMENT & OPERATOR
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-slate-600">Total Amount:</span>
                      <span className="font-mono-code font-bold text-slate-900 text-sm">
                        ₹{ord.amount}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-emerald-700">
                      <span>Advance Paid:</span>
                      <span className="font-mono-code font-bold">₹{ord.advancePaid}</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1 border-t border-slate-200">
                      <span className="font-bold text-slate-800">Balance Due:</span>
                      <span
                        className={`font-mono-code font-black text-sm ${
                          ord.balanceAmount > 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        ₹{ord.balanceAmount}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Assigned: <span className="font-medium text-slate-800">{ord.designerOperator}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  {ord.remarks && <span>Remarks: {ord.remarks}</span>}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDeleteOrder(ord)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    title="Remove / Delete Order"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Delete</span>
                  </button>

                  <button
                    onClick={() => onQuickWhatsApp(ord)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Notice</span>
                  </button>

                  <button
                    onClick={() => onOpenReceipt(ord)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
