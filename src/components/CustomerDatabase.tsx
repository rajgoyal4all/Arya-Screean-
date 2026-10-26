import React, { useState } from 'react';
import { OrderItem } from '../types';
import {
  Database,
  Search,
  Download,
  Filter,
  Eye,
  FileSpreadsheet,
  Phone,
  Calendar,
  IndianRupee,
  CheckCircle,
  X,
  Trash2,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface CustomerDatabaseProps {
  orders: OrderItem[];
  onOpenReceipt: (order: OrderItem) => void;
  onDeleteOrder: (order: OrderItem) => void;
}

export const CustomerDatabase: React.FC<CustomerDatabaseProps> = ({
  orders,
  onOpenReceipt,
  onDeleteOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState<string>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<OrderItem | null>(null);

  // Filtered customers
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      searchTerm === '' ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.mobileNumber.includes(searchTerm) ||
      o.whatsappNumber.includes(searchTerm) ||
      o.villageTown.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.orderId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesWorkType =
      selectedWorkType === 'ALL' || o.workType === selectedWorkType;

    return matchesSearch && matchesWorkType;
  });

  const exportCustomerDbOnly = () => {
    const data = filteredOrders.map((o) => ({
      'Customer ID': o.customerId,
      'Date & Time': o.dateTime,
      'Customer Name': o.customerName,
      'Mobile Number': o.mobileNumber,
      'WhatsApp Number': o.whatsappNumber,
      'Address': o.address,
      'Village/Town': o.villageTown,
      'District': o.district,
      'Pincode': o.pincode,
      'Email ID': o.email,
      'Work Type': o.workType,
      'Work Description': o.workDescription,
      'Quantity': o.quantity,
      'Size/Dimensions': o.sizeDimensions,
      'Material': o.material,
      'Design/File Name': o.designFileName,
      'Design/File Upload/Link': o.designFileUploadOrLink,
      'Delivery Date': o.deliveryDate,
      'Amount': o.amount,
      'Advance Paid': o.advancePaid,
      'Balance Amount': o.balanceAmount,
      'Payment Status': o.paymentStatus,
      'Order Status': o.orderStatus,
      'Handling Designer': o.designerOperator || 'Arya Production Team',
      'Remarks': o.remarks,
      'Order ID': o.orderId,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customer Database');
    XLSX.writeFile(wb, `ARYA_SCREEN_Customer_Database_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Top Sheet Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Customer Database Sheet
              </h1>
              <p className="text-xs text-slate-500">
                Permanent organized repository of customer profiles, contact info, job specs, and billing records
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={exportCustomerDbOnly}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Customer Sheet (.xlsx)</span>
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
            placeholder="Search by Customer ID, Name, Mobile, Village, Order ID..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedWorkType}
            onChange={(e) => setSelectedWorkType(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white outline-none w-full sm:w-auto"
          >
            <option value="ALL">All Work Types</option>
            <option value="Flex Printing">Flex Printing</option>
            <option value="Banner">Banner</option>
            <option value="DTP">DTP</option>
            <option value="Visiting Card">Visiting Card</option>
            <option value="Wedding Card">Wedding Card</option>
            <option value="Invitation Card">Invitation Card</option>
            <option value="Poster">Poster</option>
            <option value="Pamphlet">Pamphlet</option>
            <option value="Photo Printing">Photo Printing</option>
            <option value="Lamination">Lamination</option>
            <option value="Xerox">Xerox</option>
          </select>
        </div>
      </div>

      {/* Excel Sheet Table Grid View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono-code font-semibold">
          <span>Sheet: [Customer Database] ({filteredOrders.length} records)</span>
          <span className="text-[11px] text-slate-500">24 standard columns configured</span>
        </div>

        <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300 sticky top-0 z-10 select-none text-[11px]">
              <tr className="divide-x divide-slate-200">
                <th className="py-2.5 px-3 whitespace-nowrap bg-slate-100">#</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Customer ID</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Date & Time</th>
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[180px]">Customer Name</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Mobile</th>
                <th className="py-2.5 px-3 whitespace-nowrap">WhatsApp</th>
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[160px]">Address</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Village/Town</th>
                <th className="py-2.5 px-3 whitespace-nowrap">District</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Pincode</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Work Type</th>
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[200px]">Work Description</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Qty</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Dimensions</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Material</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Design File</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Delivery Date</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Amount (₹)</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Advance (₹)</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Balance (₹)</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">Payment Status</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">Order Status</th>
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[140px]">Handling Designer</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Order ID</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center bg-slate-100">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={25} className="py-12 text-center text-slate-400">
                    No customer records found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord, idx) => (
                  <tr
                    key={ord.id}
                    className="hover:bg-emerald-50/40 divide-x divide-slate-100 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono-code text-slate-400 bg-slate-50/50 text-center">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono-code font-bold text-emerald-800 whitespace-nowrap">
                      {ord.customerId}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 font-mono-code text-[11px]">
                      {ord.dateTime}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {ord.customerName}
                    </td>
                    <td className="py-2.5 px-3 font-mono-code text-slate-700 whitespace-nowrap">
                      {ord.mobileNumber}
                    </td>
                    <td className="py-2.5 px-3 font-mono-code text-slate-700 whitespace-nowrap">
                      {ord.whatsappNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-[200px]" title={ord.address}>
                      {ord.address || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {ord.villageTown || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {ord.district || '—'}
                    </td>
                    <td className="py-2.5 px-3 font-mono-code text-slate-600 whitespace-nowrap">
                      {ord.pincode || '—'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-semibold text-slate-800">
                      {ord.workType}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-[220px]" title={ord.workDescription}>
                      {ord.workDescription}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-code font-bold text-slate-800">
                      {ord.quantity}
                    </td>
                    <td className="py-2.5 px-3 font-mono-code text-slate-700 whitespace-nowrap">
                      {ord.sizeDimensions}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {ord.material || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono-code text-[11px] whitespace-nowrap">
                      {ord.designFileName || 'Pending'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 font-mono-code">
                      {ord.deliveryDate}
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
                        <span className="text-emerald-600">0</span>
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
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 border border-emerald-200">
                          {(ord.designerOperator || 'D').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800 text-xs truncate max-w-[140px]" title={ord.designerOperator}>
                          {ord.designerOperator || 'Arya Team'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono-code font-bold text-slate-900 whitespace-nowrap">
                      {ord.orderId}
                    </td>
                    <td className="py-2.5 px-3 text-center bg-slate-50/50 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedRecord(ord)}
                          className="p-1 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded transition-colors cursor-pointer"
                          title="View Full Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteOrder(ord)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Remove / Delete Record"
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

      {/* Customer Record Full View Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono-code text-emerald-700 font-bold">
                  {selectedRecord.customerId}
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {selectedRecord.customerName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-bold block mb-1">CONTACT INFO</span>
                <div>Mobile: +91 {selectedRecord.mobileNumber}</div>
                <div>WhatsApp: +91 {selectedRecord.whatsappNumber}</div>
                <div>Email: {selectedRecord.email || 'None'}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-bold block mb-1">LOCATION</span>
                <div>{selectedRecord.address || 'Address not entered'}</div>
                <div>{selectedRecord.villageTown}, {selectedRecord.district} - {selectedRecord.pincode}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2">
                <span className="text-slate-500 font-bold block mb-1">WORK ORDER DETAILS</span>
                <div className="font-semibold text-slate-900">{selectedRecord.workType}: {selectedRecord.workDescription}</div>
                <div className="text-slate-600 mt-1">
                  Size: {selectedRecord.sizeDimensions} • Qty: {selectedRecord.quantity} • Material: {selectedRecord.material}
                </div>
                {selectedRecord.designFileName && (
                  <div className="text-slate-600 mt-0.5">File: {selectedRecord.designFileName}</div>
                )}
                <div className="text-emerald-900 font-bold mt-1 bg-emerald-50 px-2.5 py-1 rounded inline-block">
                  Handling Designer: {selectedRecord.designerOperator || 'Arya Production Team'}
                </div>
                {selectedRecord.specialInstructions && (
                  <div className="text-amber-800 mt-1 bg-amber-50 p-2 rounded">
                    Instructions: {selectedRecord.specialInstructions}
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-slate-500 font-bold block">FINANCIAL BALANCE</span>
                  <div className="font-mono-code font-black text-base text-slate-900 mt-0.5">
                    Total: ₹{selectedRecord.amount} | Advance: ₹{selectedRecord.advancePaid} | Balance: ₹{selectedRecord.balanceAmount}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const rec = selectedRecord;
                      setSelectedRecord(null);
                      onDeleteOrder(rec);
                    }}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Record</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenReceipt(selectedRecord);
                      setSelectedRecord(null);
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm"
                  >
                    Print Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
