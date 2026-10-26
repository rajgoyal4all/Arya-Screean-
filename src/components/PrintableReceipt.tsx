import React from 'react';
import { OrderItem, ShopProfile } from '../types';
import { AryaLogo } from './AryaLogo';
import { Printer, X, Download, MessageSquare, CheckCircle } from 'lucide-react';
import { getDirectWhatsAppUrl, formatWhatsAppMessage } from '../utils/whatsapp';

interface PrintableReceiptProps {
  order: OrderItem | null;
  shopProfile: ShopProfile;
  onClose: () => void;
}

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({
  order,
  shopProfile,
  onClose,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-300 my-8">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Arya Screen Official Order Receipt / Job Slip
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={getDirectWhatsAppUrl(order.whatsappNumber, formatWhatsAppMessage(order))}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Send WhatsApp</span>
            </a>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt (Ctrl+P)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTENT AREA */}
        <div
          id="printable-receipt-area"
          className="bg-white text-slate-900 p-6 border-2 border-slate-800 rounded-xl"
        >
          {/* Header Branding */}
          <div className="text-center pb-4 border-b-2 border-slate-800 flex flex-col items-center">
            <div className="mb-2">
              <AryaLogo
                customLogoUrl={shopProfile.logoUrl}
                logoStyle={shopProfile.logoStyle}
                accentColor={shopProfile.accentColor}
                shopName={shopProfile.shopName}
                tagline={shopProfile.tagline}
                size="md"
                showSubtitle={false}
              />
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase font-sans">
              {shopProfile.shopName}
            </h1>
            <p className="text-xs font-bold tracking-widest text-emerald-800 uppercase mt-0.5">
              {shopProfile.tagline}
            </p>
            <p className="text-[11px] text-slate-600 mt-1 max-w-md">
              {shopProfile.address}, {shopProfile.villageTown}, {shopProfile.district} - {shopProfile.pincode}
            </p>
            <p className="text-[11px] font-mono-code text-slate-700 font-semibold mt-0.5">
              Phone: {shopProfile.phone1} {shopProfile.phone2 ? `/ ${shopProfile.phone2}` : ''} | GSTIN: {shopProfile.gstNumber}
            </p>
          </div>

          {/* Receipt Title & Order Key Meta */}
          <div className="my-3 py-2 px-3 bg-slate-100 rounded-lg flex items-center justify-between border border-slate-300">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                OFFICIAL WORK ORDER RECEIPT
              </span>
              <span className="text-lg font-black font-mono-code text-slate-950">
                {order.orderId}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                DATE & TIME
              </span>
              <span className="text-xs font-mono-code font-bold text-slate-800">
                {order.dateTime}
              </span>
            </div>
          </div>

          {/* Customer Details Box */}
          <div className="grid grid-cols-2 gap-3 text-xs py-2 border-b border-slate-300">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">CUSTOMER DETAILS:</span>
              <div className="font-extrabold text-sm text-slate-900 mt-0.5">
                {order.customerName}
              </div>
              <div className="font-mono-code text-slate-700 mt-0.5">
                Mobile: +91 {order.mobileNumber}
              </div>
              {order.address && (
                <div className="text-slate-600 mt-0.5">
                  {order.address}, {order.villageTown}
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">CUSTOMER ID:</span>
              <div className="font-mono-code font-bold text-slate-800 text-sm mt-0.5">
                {order.customerId}
              </div>
              <div className="mt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">DELIVERY DATE:</span>
                <div className="font-mono-code font-black text-emerald-800 text-sm">
                  {order.deliveryDate || 'Standard'}
                </div>
              </div>
              <div className="mt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">HANDLING DESIGNER:</span>
                <div className="font-semibold text-slate-900 text-xs mt-0.5">
                  {order.designerOperator || 'Arya Production Team'}
                </div>
              </div>
            </div>
          </div>

          {/* Job Specifications Table */}
          <div className="mt-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              WORK SPECIFICATIONS:
            </span>
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 font-bold border-b border-slate-300 text-[11px]">
                <tr>
                  <th className="py-1.5 px-2">Work Type & Description</th>
                  <th className="py-1.5 px-2">Size / Dimensions</th>
                  <th className="py-1.5 px-2 text-center">Qty</th>
                  <th className="py-1.5 px-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2.5 px-2">
                    <div className="font-bold text-slate-900">{order.workType}</div>
                    <div className="text-slate-600 text-[11px] mt-0.5">{order.workDescription}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Material: {order.material || 'Standard Media'}
                    </div>
                    {order.specialInstructions && (
                      <div className="text-[10px] text-amber-900 mt-0.5 bg-amber-50 p-1 rounded inline-block">
                        Note: {order.specialInstructions}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-2 font-mono-code text-slate-800">
                    {order.sizeDimensions || `${order.width}x${order.height}`}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono-code font-bold text-slate-900">
                    {order.quantity}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono-code font-bold text-slate-900">
                    ₹{order.amount}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Breakdown */}
          <div className="mt-4 flex justify-end">
            <div className="w-64 space-y-1.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Order Amount:</span>
                <span className="font-mono-code font-bold text-slate-900">₹{order.amount}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-medium">
                <span>Advance Paid ({order.paymentMethod}):</span>
                <span className="font-mono-code font-bold">₹{order.advancePaid}</span>
              </div>
              <div className="flex justify-between pt-1 border-t-2 border-slate-300 font-black text-sm">
                <span>Balance Due:</span>
                <span className={`font-mono-code ${order.balanceAmount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  ₹{order.balanceAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Footer & Terms */}
          <div className="mt-6 pt-4 border-t border-slate-300 text-[10px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800">TERMS & CONDITIONS:</div>
            <div>1. Final color output on Flex/Vinyl may vary ±5% from RGB screen monitors.</div>
            <div>2. Customer is strictly responsible for matter/spelling verification before final approval.</div>
            <div>3. Goods once printed will not be returned or exchanged.</div>
            <div>4. Please present this receipt or Order ID at the time of delivery collection.</div>
          </div>

          {/* Signatures */}
          <div className="mt-8 pt-4 flex items-center justify-between text-xs">
            <div className="text-center">
              <div className="w-36 border-t border-slate-400 mb-1"></div>
              <span className="text-[10px] font-bold text-slate-600 uppercase">Customer Signature</span>
            </div>

            <div className="text-center">
              <div className="w-48 border-t-2 border-slate-800 mb-1 font-bold text-slate-950 font-mono-code text-[11px]">
                For {shopProfile.shopName || 'arya2'}
              </div>
              <span className="text-[10px] font-bold text-slate-600 uppercase">
                Pramod Sagria (Admin • 9938109624)
              </span>
            </div>
          </div>
        </div>

        {/* Close Button below */}
        <div className="no-print mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
          >
            Close Receipt View
          </button>
        </div>
      </div>
    </div>
  );
};
