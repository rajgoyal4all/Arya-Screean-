import React from 'react';
import { AlertTriangle, Trash2, X, RefreshCw } from 'lucide-react';
import { OrderItem } from '../types';

export type DeleteTarget =
  | { type: 'order'; order: OrderItem }
  | { type: 'log'; logId: string; orderId: string }
  | { type: 'all_database'; count: number }
  | { type: 'all_logs'; count: number }
  | null;

interface DeleteConfirmModalProps {
  target: DeleteTarget;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  target,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !target) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-300 my-8">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                {target.type === 'all_database'
                  ? 'Clear Entire Database?'
                  : target.type === 'all_logs'
                  ? 'Clear All WhatsApp Logs?'
                  : target.type === 'order'
                  ? `Delete Order ${target.order.orderId}?`
                  : 'Delete WhatsApp Log?'}
              </h3>
              <p className="text-xs text-slate-500">
                Action requires confirmation • Permanent removal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 text-xs text-slate-600 space-y-3">
          {target.type === 'all_database' && (
            <div className="space-y-2">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 leading-relaxed">
                <p className="font-bold flex items-center gap-1.5 text-rose-800 text-sm mb-1">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  Warning: Irreversible Action
                </p>
                This will delete <strong>all {target.count} customer orders</strong>, work logs, payment history, and WhatsApp transmission records from Arya Screen.
              </div>
              <p className="text-[11px] text-slate-500">
                Shop profile details and Meta API credentials will remain saved. The next new order will start cleanly from <strong>ARYA-2026-0001</strong>.
              </p>
            </div>
          )}

          {target.type === 'all_logs' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
              This will remove all <strong>{target.count} WhatsApp message delivery logs</strong> from the system log sheet.
            </div>
          )}

          {target.type === 'order' && (
            <div className="space-y-2">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="font-mono-code font-bold text-slate-900">{target.order.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-900">{target.order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Work Type:</span>
                  <span className="font-medium text-slate-800">{target.order.workType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Amount:</span>
                  <span className="font-mono-code font-bold text-slate-900">₹{target.order.amount}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                This order will be removed from Customer Database, Work Orders, and financial totals.
              </p>
            </div>
          )}

          {target.type === 'log' && (
            <p className="leading-relaxed">
              Are you sure you want to remove this WhatsApp transmission record for order <strong>{target.orderId}</strong>?
            </p>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>
              {target.type === 'all_database'
                ? 'Yes, Clear All Database'
                : target.type === 'all_logs'
                ? 'Yes, Clear All Logs'
                : 'Yes, Delete Record'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
