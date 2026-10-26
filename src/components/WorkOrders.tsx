import React, { useState } from 'react';
import { OrderItem, OrderStatus } from '../types';
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  Printer,
  MessageSquare,
  CheckCircle,
  Clock,
  Sparkles,
  UserCheck,
  Trash2,
  UserPlus,
  Palette,
  Calendar,
  Smartphone,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { AddDesignerModal } from './AddDesignerModal';
import { getAdminOrderWhatsAppUrl } from '../utils/whatsapp';

interface WorkOrdersProps {
  orders: OrderItem[];
  designers?: string[];
  onAddDesigner?: (designerName: string) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onUpdateDesigner: (orderId: string, designer: string) => void;
  onOpenReceipt: (order: OrderItem) => void;
  onQuickWhatsApp: (order: OrderItem) => void;
  onDeleteOrder: (order: OrderItem) => void;
  onSwitchToCalendar?: () => void;
  onConfirmOrder?: (order: OrderItem) => void;
}

const ORDER_STATUSES: OrderStatus[] = [
  'Pending Confirmation',
  'Confirmed',
  'New',
  'Design Pending',
  'Designing',
  'Customer Approval',
  'Printing',
  'Finishing',
  'Ready',
  'Delivered',
  'Cancelled',
];

const OPERATORS = [
  'Ramesh Sharma (Flex Master)',
  'Sunil Verma (DTP & Graphics)',
  'Priya Rajput (Wedding Cards & Design)',
  'Mohit Saini (Finishing & Printing)',
  'Direct Counter Operator',
];

export const WorkOrders: React.FC<WorkOrdersProps> = ({
  orders,
  designers = OPERATORS,
  onAddDesigner,
  onUpdateOrderStatus,
  onUpdateDesigner,
  onOpenReceipt,
  onQuickWhatsApp,
  onDeleteOrder,
  onSwitchToCalendar,
  onConfirmOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [designerFilter, setDesignerFilter] = useState<string>('ALL');
  const [isAddDesignerOpen, setIsAddDesignerOpen] = useState(false);
  const [assignTargetOrderId, setAssignTargetOrderId] = useState<string | null>(null);

  const activeDesigners = designers && designers.length > 0 ? designers : OPERATORS;

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      searchTerm === '' ||
      o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.mobileNumber.includes(searchTerm) ||
      o.workType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.designerOperator.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || o.orderStatus === statusFilter;

    const matchesDesigner =
      designerFilter === 'ALL' ||
      o.designerOperator.toLowerCase().includes(designerFilter.toLowerCase()) ||
      o.designerOperator === designerFilter;

    return matchesSearch && matchesStatus && matchesDesigner;
  });

  // Conditional formatting classes
  const getStatusColorClass = (status: OrderStatus) => {
    switch (status) {
      case 'Pending Confirmation':
        return 'bg-amber-100 text-amber-950 border-amber-400 ring-2 ring-amber-500 font-bold';
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300 font-bold';
      case 'New':
        return 'bg-blue-50 text-blue-700 border-blue-300 ring-1 ring-blue-300';
      case 'Design Pending':
        return 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-300';
      case 'Designing':
        return 'bg-purple-50 text-purple-700 border-purple-300 ring-1 ring-purple-300';
      case 'Customer Approval':
        return 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-1 ring-indigo-300';
      case 'Printing':
        return 'bg-cyan-50 text-cyan-800 border-cyan-300 ring-1 ring-cyan-300';
      case 'Finishing':
        return 'bg-orange-50 text-orange-800 border-orange-300 ring-1 ring-orange-300';
      case 'Ready':
        return 'bg-emerald-100 text-emerald-900 border-emerald-400 ring-2 ring-emerald-500 font-bold';
      case 'Delivered':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const exportWorkOrdersSheet = () => {
    const data = filteredOrders.map((o) => ({
      'Order ID': o.orderId,
      'Date': o.dateTime.split(' ')[0],
      'Customer Name': o.customerName,
      'Mobile': o.mobileNumber,
      'Work Type': o.workType,
      'Design/File': o.designFileName || 'Pending',
      'Size': o.sizeDimensions,
      'Quantity': o.quantity,
      'Amount (₹)': o.amount,
      'Advance (₹)': o.advancePaid,
      'Balance (₹)': o.balanceAmount,
      'Designer/Operator': o.designerOperator,
      'Order Status': o.orderStatus,
      'Delivery Date': o.deliveryDate,
      'Remarks': o.remarks,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'WORK ORDERS');
    XLSX.writeFile(wb, `ARYA_SCREEN_WORK_ORDERS_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Sheet Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 text-purple-800 rounded-lg">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                WORK ORDERS Sheet (Flex & DTP Production)
              </h1>
              <p className="text-xs text-slate-500">
                Job queue with conditional formatting, operator assignments, and live status dropdowns
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {onSwitchToCalendar && (
            <button
              onClick={onSwitchToCalendar}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Visualize orders by delivery date on interactive monthly calendar"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Calendar View (Drag &amp; Drop)</span>
            </button>
          )}

          <button
            onClick={() => setIsAddDesignerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Register a new designer or operator"
          >
            <UserPlus className="w-3.5 h-3.5 text-purple-600" />
            <span>+ Add Designer</span>
          </button>

          <button
            onClick={exportWorkOrdersSheet}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Work Orders (.xlsx)</span>
          </button>
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
            placeholder="Search Order ID, Customer Name, Mobile, Operator..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white outline-none w-full sm:w-auto"
          >
            <option value="ALL">All Statuses ({orders.length})</option>
            {ORDER_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st} ({orders.filter((o) => o.orderStatus === st).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter by Handling Designer Row */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 uppercase tracking-wider mr-1">
          <Palette className="w-3.5 h-3.5 text-emerald-700" />
          <span>Filter by Handling Designer:</span>
        </div>
        <button
          onClick={() => setDesignerFilter('ALL')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            designerFilter === 'ALL'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All Handlers ({orders.length})
        </button>
        {activeDesigners.map((designer) => {
          const count = orders.filter((o) =>
            o.designerOperator.toLowerCase().includes(designer.toLowerCase()) ||
            o.designerOperator === designer
          ).length;
          const isSelected = designerFilter === designer;
          const shortName = designer.split('(')[0].trim();
          return (
            <button
              key={designer}
              onClick={() => setDesignerFilter(isSelected ? 'ALL' : designer)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-800'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span>{shortName}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono-code ${
                  isSelected ? 'bg-emerald-900 text-emerald-200' : 'bg-emerald-200/80 text-emerald-900'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Conditional Formatting Status Legend */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
          Color Guide:
        </span>
        {ORDER_STATUSES.map((st) => (
          <span
            key={st}
            onClick={() => setStatusFilter(statusFilter === st ? 'ALL' : st)}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border cursor-pointer transition-all ${getStatusColorClass(
              st
            )} ${statusFilter === st ? 'ring-2 ring-slate-900 shadow-xs' : 'opacity-90 hover:opacity-100'}`}
          >
            {st}
          </span>
        ))}
      </div>

      {/* Main WORK ORDERS Excel Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono-code font-semibold">
          <span>Sheet: [WORK ORDERS] ({filteredOrders.length} active jobs)</span>
          <span className="text-[11px] text-slate-500">Live inline editable statuses</span>
        </div>

        <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300 sticky top-0 z-10 select-none text-[11px]">
              <tr className="divide-x divide-slate-200">
                <th className="py-2.5 px-3 whitespace-nowrap bg-slate-100">#</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Order ID</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[170px]">Customer Name</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Mobile</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Work Type</th>
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[130px]">Design/File</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Size</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Qty</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Amount</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Advance</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Balance</th>
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[210px] bg-emerald-50 text-emerald-950 border-x border-emerald-200">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Palette className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Handling Designer</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[150px] text-center bg-slate-100">
                  Order Status (Dropdown)
                </th>
                <th className="py-2.5 px-3 whitespace-nowrap">Delivery Date</th>
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[160px]">Remarks</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center bg-slate-100">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={17} className="py-12 text-center text-slate-400">
                    No work orders found matching the filter.
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
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 font-mono-code text-[11px]">
                      {ord.dateTime.split(' ')[0]}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {ord.customerName}
                    </td>
                    <td className="py-2.5 px-3 font-mono-code text-slate-700 whitespace-nowrap">
                      {ord.mobileNumber}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">{ord.workType}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono-code text-slate-600 text-[11px] truncate max-w-[140px]" title={ord.designFileName}>
                      {ord.designFileName || 'Pending'}
                    </td>
                    <td className="py-2.5 px-3 font-mono-code text-slate-700 whitespace-nowrap">
                      {ord.sizeDimensions}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-code font-bold text-slate-800">
                      {ord.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-code font-bold text-slate-900">
                      ₹{ord.amount}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-code text-emerald-700 font-bold">
                      ₹{ord.advancePaid}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-code font-bold">
                      {ord.balanceAmount > 0 ? (
                        <span className="text-rose-600">₹{ord.balanceAmount}</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">Paid</span>
                      )}
                    </td>

                    {/* Operator Assignment Dropdown */}
                    <td className="py-2 px-2.5 whitespace-nowrap bg-emerald-50/20 border-x border-emerald-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-700 text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                          {(ord.designerOperator || 'D').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <select
                            value={ord.designerOperator}
                            onChange={(e) => {
                              if (e.target.value === '__ADD_NEW__') {
                                setAssignTargetOrderId(ord.orderId);
                                setIsAddDesignerOpen(true);
                              } else {
                                onUpdateDesigner(ord.orderId, e.target.value);
                              }
                            }}
                            className="w-full text-xs font-bold text-slate-900 px-2 py-1 rounded border border-emerald-300 bg-white hover:border-emerald-600 focus:border-emerald-600 outline-none cursor-pointer truncate shadow-2xs"
                            title={`Handling Designer: ${ord.designerOperator} (click to reassign)`}
                          >
                            {activeDesigners.map((op) => (
                              <option key={op} value={op}>
                                {op}
                              </option>
                            ))}
                            <option value="__ADD_NEW__" className="text-emerald-700 font-bold bg-emerald-50">
                              ➕ + Add New Designer...
                            </option>
                          </select>
                          <div className="text-[9px] font-bold text-emerald-800 tracking-wider uppercase mt-0.5">
                            Handling Designer
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Order Status Dropdown with Conditional Formatting */}
                    <td className="py-2 px-2 text-center whitespace-nowrap bg-slate-50/40">
                      <div className="flex flex-col items-center gap-1">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) =>
                            onUpdateOrderStatus(ord.orderId, e.target.value as OrderStatus)
                          }
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer outline-none transition-all shadow-xs ${getStatusColorClass(
                            ord.orderStatus
                          )}`}
                        >
                          {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st} className="bg-white text-slate-900 font-medium">
                              {st}
                            </option>
                          ))}
                        </select>

                        {(!ord.adminConfirmed || ord.orderStatus === 'Pending Confirmation') && onConfirmOrder && (
                          <button
                            type="button"
                            onClick={() => onConfirmOrder(ord)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-black shadow-2xs transition-all active:scale-95 cursor-pointer"
                            title="Confirm this order as Admin Pramod Sagria (9938109624)"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Confirm (Admin)</span>
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 font-mono-code">
                      {ord.deliveryDate}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 truncate max-w-[180px]" title={ord.remarks}>
                      {ord.remarks || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center bg-slate-50/50 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenReceipt(ord)}
                          className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded cursor-pointer"
                          title="Print Arya Screen Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onQuickWhatsApp(ord)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 rounded cursor-pointer"
                          title="Send / Resend WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={getAdminOrderWhatsAppUrl(ord)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded cursor-pointer inline-flex"
                          title="Direct Deliver Order to Admin Mobile 9938109624 via WhatsApp"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                        </a>
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

      {/* Add Designer Modal */}
      <AddDesignerModal
        isOpen={isAddDesignerOpen}
        onClose={() => {
          setIsAddDesignerOpen(false);
          setAssignTargetOrderId(null);
        }}
        existingDesigners={activeDesigners}
        onAddDesigner={(newName) => {
          if (onAddDesigner) {
            onAddDesigner(newName);
          }
          if (assignTargetOrderId) {
            onUpdateDesigner(assignTargetOrderId, newName);
          }
          setAssignTargetOrderId(null);
        }}
      />
    </div>
  );
};
