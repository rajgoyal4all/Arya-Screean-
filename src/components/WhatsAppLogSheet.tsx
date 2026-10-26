import React, { useState } from 'react';
import { WhatsAppLogEntry, ApiSettings, OrderItem } from '../types';
import {
  MessageSquare,
  Search,
  RotateCw,
  Download,
  CheckCircle2,
  AlertTriangle,
  Eye,
  ExternalLink,
  X,
  Send,
  Trash2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { sendWhatsAppMessage, getDirectWhatsAppUrl } from '../utils/whatsapp';

interface WhatsAppLogSheetProps {
  logs: WhatsAppLogEntry[];
  orders: OrderItem[];
  apiSettings: ApiSettings;
  onUpdateLog: (updatedLog: WhatsAppLogEntry) => void;
  onDeleteLog: (logId: string, orderId: string) => void;
  onClearAllLogs: () => void;
}

export const WhatsAppLogSheet: React.FC<WhatsAppLogSheetProps> = ({
  logs,
  orders,
  apiSettings,
  onUpdateLog,
  onDeleteLog,
  onClearAllLogs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [inspectLog, setInspectLog] = useState<WhatsAppLogEntry | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      searchTerm === '' ||
      l.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.whatsappNumber.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'ALL' || l.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRetry = async (log: WhatsAppLogEntry) => {
    setRetryingId(log.id);
    const relatedOrder = orders.find((o) => o.orderId === log.orderId);

    if (!relatedOrder) {
      alert(`Could not find order ${log.orderId} in database.`);
      setRetryingId(null);
      return;
    }

    try {
      const result = await sendWhatsAppMessage(relatedOrder, apiSettings, log.messageType);
      const updated: WhatsAppLogEntry = {
        ...log,
        status: result.status,
        apiResponse: result.logEntry.apiResponse,
        retryCount: (log.retryCount || 0) + 1,
        dateTime: result.logEntry.dateTime,
      };

      onUpdateLog(updated);
    } catch (e: any) {
      alert(`Retry failed: ${e?.message || 'Network error'}`);
    } finally {
      setRetryingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Read':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Delivered':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Sent':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Failed':
      case 'Message Failed':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'Pending':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  const exportWhatsAppLogsSheet = () => {
    const data = filteredLogs.map((l) => ({
      'Date & Time': l.dateTime,
      'Order ID': l.orderId,
      'Customer Name': l.customerName,
      'WhatsApp Number': l.whatsappNumber,
      'Message Type': l.messageType,
      'Message Status': l.status,
      'API Response': l.apiResponse,
      'Retry Count': l.retryCount,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'WHATSAPP LOG');
    XLSX.writeFile(wb, `ARYA_SCREEN_WHATSAPP_LOG_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              WHATSAPP LOG Sheet (Meta Cloud API)
            </h1>
            <p className="text-xs text-slate-500">
              Audit trail of automated WhatsApp confirmations, delivery receipts, and error retries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <button
              onClick={onClearAllLogs}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Clear all WhatsApp message logs"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Clear All Logs</span>
            </button>
          )}

          <button
            onClick={exportWhatsAppLogsSheet}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export WhatsApp Log (.xlsx)</span>
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
            placeholder="Search by Order ID, Customer Name, Mobile..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none font-medium"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white outline-none w-full sm:w-auto"
        >
          <option value="ALL">All Statuses ({logs.length})</option>
          <option value="Sent">Sent</option>
          <option value="Delivered">Delivered</option>
          <option value="Read">Read</option>
          <option value="Failed">Failed / Message Failed</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono-code font-semibold">
          <span>Sheet: [WHATSAPP LOG] ({filteredLogs.length} entries)</span>
          <span className="text-[11px] text-slate-500">Official Cloud API v21.0 payload tracking</span>
        </div>

        <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300 sticky top-0 z-10 select-none text-[11px]">
              <tr className="divide-x divide-slate-200">
                <th className="py-2.5 px-3 whitespace-nowrap bg-slate-100">#</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Date & Time</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Order ID</th>
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[170px]">Customer Name</th>
                <th className="py-2.5 px-3 whitespace-nowrap">WhatsApp Number</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Message Type</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">Status</th>
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[200px]">API Response Summary</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">Retry Count</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center bg-slate-100">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No WhatsApp logs found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/80 divide-x divide-slate-100 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono-code text-slate-400 bg-slate-50/50 text-center">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono-code text-slate-600 text-[11px]">
                      {log.dateTime}
                    </td>
                    <td className="py-2.5 px-3 font-mono-code font-bold text-slate-900 whitespace-nowrap">
                      {log.orderId}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {log.customerName}
                    </td>
                    <td className="py-2.5 px-3 font-mono-code text-slate-700 whitespace-nowrap">
                      +91 {log.whatsappNumber}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                      {log.messageType}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${getStatusBadge(
                          log.status
                        )}`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td
                      className="py-2.5 px-3 text-slate-600 font-mono-code text-[11px] truncate max-w-[240px]"
                      title={log.apiResponse}
                    >
                      {log.apiResponse}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono-code font-bold text-slate-700">
                      {log.retryCount || 0}
                    </td>
                    <td className="py-2.5 px-3 text-center bg-slate-50/50 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Option to Retry if failed */}
                        {log.status === 'Failed' && (
                          <button
                            onClick={() => handleRetry(log)}
                            disabled={retryingId === log.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold cursor-pointer disabled:opacity-50"
                            title="Retry WhatsApp API dispatch"
                          >
                            <RotateCw
                              className={`w-3 h-3 ${retryingId === log.id ? 'animate-spin' : ''}`}
                            />
                            <span>Retry</span>
                          </button>
                        )}

                        <button
                          onClick={() => setInspectLog(log)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded cursor-pointer"
                          title="Inspect Message & API Payload"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={getDirectWhatsAppUrl(log.whatsappNumber, log.messageText)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 rounded cursor-pointer"
                          title="Open WhatsApp Web Direct"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => onDeleteLog(log.id, log.orderId)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                          title="Delete WhatsApp Log Entry"
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

      {/* Inspect Log Modal */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono-code font-bold text-slate-500">
                  {inspectLog.orderId} • {inspectLog.dateTime}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  WhatsApp Dispatch Details
                </h3>
              </div>
              <button
                onClick={() => setInspectLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <span className="text-slate-500 font-bold block mb-1">RECIPIENT & STATUS</span>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div>Customer: <strong className="text-slate-900">{inspectLog.customerName}</strong></div>
                  <div>WhatsApp Number: <strong className="font-mono-code">+91 {inspectLog.whatsappNumber}</strong></div>
                  <div>
                    Status:{' '}
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getStatusBadge(inspectLog.status)}`}>
                      {inspectLog.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">MESSAGE CONTENT</span>
                <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-slate-800 whitespace-pre-wrap font-sans text-xs leading-relaxed">
                  {inspectLog.messageText}
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">API RESPONSE / PAYLOAD</span>
                <pre className="p-3.5 bg-slate-900 text-emerald-400 rounded-xl font-mono-code text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {inspectLog.apiResponse}
                </pre>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <a
                  href={getDirectWhatsAppUrl(inspectLog.whatsappNumber, inspectLog.messageText)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send via WhatsApp Web</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
