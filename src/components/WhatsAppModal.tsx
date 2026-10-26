import React, { useState, useEffect } from 'react';
import { OrderItem, ApiSettings, WhatsAppLogEntry } from '../types';
import {
  MessageSquare,
  Send,
  ExternalLink,
  Copy,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Zap,
  Globe,
  Settings,
} from 'lucide-react';
import {
  formatWhatsAppMessage,
  formatNormalSmsMessage,
  formatAdminOrderNotificationMessage,
  formatAdminOrderSmsMessage,
  getDirectSmsUrl,
  cleanPhoneNumber,
  getDirectWhatsAppUrl,
  getAdminOrderWhatsAppUrl,
  getAdminOrderSmsUrl,
  openWhatsAppDirectly,
  sendWhatsAppMessage,
  hasLiveMetaCredentials,
  WhatsAppMessageType,
  ADMIN_PHONE_NUMBER,
  ADMIN_NAME,
} from '../utils/whatsapp';
import { Phone, ShieldCheck, Smartphone } from 'lucide-react';

interface WhatsAppModalProps {
  order: OrderItem | null;
  apiSettings: ApiSettings;
  isOpen: boolean;
  onClose: () => void;
  onLogUpdated: (log: WhatsAppLogEntry) => void;
  onOrderStatusUpdated?: (orderId: string, status: any) => void;
  onNavigateToSettings?: () => void;
  initialMessageType?: WhatsAppMessageType;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  order,
  apiSettings,
  isOpen,
  onClose,
  onLogUpdated,
  onOrderStatusUpdated,
  onNavigateToSettings,
  initialMessageType,
}) => {
  if (!isOpen || !order) return null;

  const [recipientTarget, setRecipientTarget] = useState<'customer' | 'admin'>('customer');
  const [messageType, setMessageType] = useState<WhatsAppMessageType>(
    initialMessageType || (order.adminConfirmed ? 'Order Confirmed by Admin' : 'Order Confirmation')
  );
  const [customPhone, setCustomPhone] = useState(
    order.whatsappNumber || order.mobileNumber
  );
  const [messageText, setMessageText] = useState(() =>
    formatWhatsAppMessage(order, initialMessageType || (order.adminConfirmed ? 'Order Confirmed by Admin' : 'Order Confirmation'))
  );
  const [copied, setCopied] = useState(false);
  const [smsCopied, setSmsCopied] = useState(false);
  const [isSendingCloudApi, setIsSendingCloudApi] = useState(false);
  const [apiResultNotice, setApiResultNotice] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Update text when recipientTarget, type, or order changes
  useEffect(() => {
    if (recipientTarget === 'admin') {
      setCustomPhone(ADMIN_PHONE_NUMBER);
      setMessageText(formatAdminOrderNotificationMessage(order));
    } else {
      setCustomPhone(order.whatsappNumber || order.mobileNumber);
      setMessageText(formatWhatsAppMessage(order, messageType));
    }
    setApiResultNotice(null);
  }, [recipientTarget, messageType, order]);

  // Sync initialMessageType if changed from parent
  useEffect(() => {
    if (initialMessageType) {
      setMessageType(initialMessageType);
    }
  }, [initialMessageType]);

  const cleanPhone = cleanPhoneNumber(customPhone);
  const isMetaLive = hasLiveMetaCredentials(apiSettings);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Method 1: Instant 100% Guaranteed Direct WhatsApp Web / Mobile
  const handleOpenDirectWhatsApp = () => {
    const success = openWhatsAppDirectly(cleanPhone, messageText);
    if (success) {
      // Record in logs
      const now = new Date();
      const dateTimeStr = `${now.toISOString().split('T')[0]} ${now
        .toTimeString()
        .split(' ')[0]
        .substring(0, 5)}`;
      const logEntry: WhatsAppLogEntry = {
        id: `log_${Date.now()}`,
        dateTime: dateTimeStr,
        orderId: order.orderId,
        customerName: order.customerName,
        whatsappNumber: cleanPhone,
        messageType,
        messageText,
        status: 'Sent',
        apiResponse: `Direct WhatsApp Web / App opened for +${cleanPhone}`,
        retryCount: 0,
      };

      onLogUpdated(logEntry);
      setApiResultNotice({
        type: 'success',
        text: `WhatsApp Web / App opened for +${cleanPhone}. Click Send inside WhatsApp to complete dispatch!`,
      });
    } else {
      setApiResultNotice({
        type: 'error',
        text: 'Popup was blocked by your browser. Please allow popups or use the direct link below.',
      });
    }
  };

  // Method 1b: Dual Auto-Open for Both Admin 9938109624 and Customer
  const handleOpenBothWhatsApp = () => {
    const adminMsg = formatAdminOrderNotificationMessage(order);
    openWhatsAppDirectly(ADMIN_PHONE_NUMBER, adminMsg);

    const custPhone = order.whatsappNumber || order.mobileNumber;
    const custMsg = formatWhatsAppMessage(order, messageType);
    openWhatsAppDirectly(custPhone, custMsg);

    setApiResultNotice({
      type: 'success',
      text: `Auto-opened WhatsApp for both Admin Pramod Sagria (9938109624) and Customer ${order.customerName} (+91 ${cleanPhoneNumber(custPhone)}). Click Send in both WhatsApp tabs!`,
    });
  };

  // Method 2: Meta Cloud API Automated Send
  const handleSendMetaCloudApi = async () => {
    setIsSendingCloudApi(true);
    setApiResultNotice(null);

    const orderWithCustomPhone: OrderItem = {
      ...order,
      whatsappNumber: cleanPhone,
    };

    try {
      const res = await sendWhatsAppMessage(
        orderWithCustomPhone,
        apiSettings,
        messageType
      );
      onLogUpdated(res.logEntry);

      if (res.success) {
        setApiResultNotice({
          type: 'success',
          text: `Success: ${res.responseDetails}`,
        });
      } else {
        setApiResultNotice({
          type: 'error',
          text: `${res.responseDetails}. You can still use the green 'Open & Send in WhatsApp' button below!`,
        });
      }
    } catch (e: any) {
      setApiResultNotice({
        type: 'error',
        text: `Error: ${e?.message || 'Meta API call failed'}`,
      });
    } finally {
      setIsSendingCloudApi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-300 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Send WhatsApp Notification
              </h3>
              <p className="text-xs text-slate-500">
                Order: <span className="font-mono-code font-bold text-slate-800">{order.orderId}</span> • {order.customerName}
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

        <div className="mt-4 space-y-4 text-xs">
          {/* Official Admin Sender Identification */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <span className="font-extrabold text-amber-950 text-xs">
                  Official Dispatch Channel: Admin Pramod Sagria
                </span>
                <div className="text-[11px] text-amber-800">
                  All WhatsApp &amp; Normal SMS notifications are sent through Admin Mobile:{' '}
                  <strong className="font-mono-code font-bold text-amber-950">9938109624</strong>
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-mono-code font-bold">
              +91 9938109624
            </span>
          </div>

          {/* Target Destination Switch: Customer vs Admin */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setRecipientTarget('customer')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                recipientTarget === 'customer'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👤 Customer: {order.customerName} ({order.mobileNumber})
            </button>
            <button
              type="button"
              onClick={() => setRecipientTarget('admin')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                recipientTarget === 'admin'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 hover:text-emerald-950 font-extrabold'
              }`}
            >
              <span>🚨 Deliver to Admin Mobile: 9938109624</span>
            </button>
          </div>

          {/* Recipient Phone & Message Type Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                {recipientTarget === 'admin' ? 'Admin Mobile (Pramod Sagria)' : 'Recipient Customer Mobile / WhatsApp'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono-code">
                  +91
                </span>
                <input
                  type="tel"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="9837012345"
                  className="w-full pl-11 pr-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm font-mono-code font-bold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                {recipientTarget === 'admin' ? 'Notification Mode' : 'Message Template Type'}
              </label>
              {recipientTarget === 'admin' ? (
                <div className="px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-900">
                  New Order Specification Dispatch (Admin Review)
                </div>
              ) : (
                <select
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value as WhatsAppMessageType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none bg-white"
                >
                  <option value="Order Confirmed by Admin">Order Confirmed by Admin (9938109624)</option>
                  <option value="Order Confirmation">Order Confirmation</option>
                  <option value="Ready for Delivery">Ready for Pickup / Delivery</option>
                  <option value="Payment Reminder">Payment / Balance Reminder</option>
                  <option value="Status Update">Work Status Update</option>
                </select>
              )}
            </div>
          </div>

          {/* Editable Message Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Message Content (Pre-formatted for Arya Screen)
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              rows={8}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs leading-relaxed text-slate-800 font-sans outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-slate-50/50"
            />
          </div>

          {/* Status Notice if any */}
          {apiResultNotice && (
            <div
              className={`p-3 rounded-xl flex items-start gap-2 text-xs ${
                apiResultNotice.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : apiResultNotice.type === 'error'
                  ? 'bg-rose-50 text-rose-900 border border-rose-200'
                  : 'bg-blue-50 text-blue-900 border border-blue-200'
              }`}
            >
              {apiResultNotice.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">{apiResultNotice.text}</div>
            </div>
          )}

          {/* PRIMARY ACTION BUTTONS */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            {/* Action buttons: WhatsApp, Dual Auto-Open & Normal SMS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleOpenDirectWhatsApp}
                className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span>
                  {recipientTarget === 'admin'
                    ? '🚀 Send to Admin (9938109624)'
                    : '🚀 Send to Customer'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleOpenBothWhatsApp}
                className="py-3 px-3 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center border border-emerald-400/40"
                title="Automatically opens WhatsApp for Admin Pramod Sagria (9938109624) and Customer"
              >
                <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
                <span>⚡ Auto-Open Both</span>
              </button>

              <a
                href={
                  recipientTarget === 'admin'
                    ? getAdminOrderSmsUrl(order)
                    : getDirectSmsUrl(cleanPhone, formatNormalSmsMessage(order, messageType))
                }
                className="py-3 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {recipientTarget === 'admin'
                    ? '📱 SMS to Admin'
                    : '📱 SMS to Customer'}
                </span>
              </a>
            </div>

            {/* Quick SMS Text Preview & Copy */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-[11px]">
              <div className="truncate text-slate-600 font-mono-code">
                SMS:{' '}
                {recipientTarget === 'admin'
                  ? formatAdminOrderSmsMessage(order)
                  : formatNormalSmsMessage(order, messageType)}
              </div>
              <button
                type="button"
                onClick={() => {
                  const smsText =
                    recipientTarget === 'admin'
                      ? formatAdminOrderSmsMessage(order)
                      : formatNormalSmsMessage(order, messageType);
                  navigator.clipboard.writeText(smsText);
                  setSmsCopied(true);
                  setTimeout(() => setSmsCopied(false), 2000);
                }}
                className="shrink-0 text-slate-700 hover:text-slate-900 font-bold px-2 py-0.5 bg-slate-200 hover:bg-slate-300 rounded cursor-pointer"
              >
                {smsCopied ? 'Copied SMS!' : 'Copy SMS'}
              </button>
            </div>

            {/* Quick Deliver to Admin Mobile toggle shortcut if in customer mode */}
            {recipientTarget === 'customer' && (
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-2 text-xs">
                <span className="text-emerald-950 text-[11px] font-semibold">
                  Want to deliver this order directly to Admin Pramod Sagria's mobile?
                </span>
                <button
                  type="button"
                  onClick={() => setRecipientTarget('admin')}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shrink-0 cursor-pointer shadow-xs"
                >
                  Switch to Admin (9938109624)
                </button>
              </div>
            )}

            {/* METHOD 2: Meta Cloud API Dispatch */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-[11px] text-slate-500">
                Meta Cloud API Status:{' '}
                <span
                  className={`font-semibold ${
                    isMetaLive ? 'text-emerald-700 font-mono-code' : 'text-amber-700'
                  }`}
                >
                  {isMetaLive ? 'Credentials Ready' : 'Setup Required in Settings'}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isSendingCloudApi}
                  onClick={handleSendMetaCloudApi}
                  className="w-full sm:w-auto px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Send in background using Meta Business Cloud API"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isSendingCloudApi ? 'Sending API...' : 'Send via Meta Cloud API'}</span>
                </button>
              </div>
            </div>

            {/* Direct Fallback link */}
            <div className="text-center pt-1">
              <a
                href={getDirectWhatsAppUrl(cleanPhone, messageText)}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-700 hover:underline font-semibold"
              >
                Direct Web Link: api.whatsapp.com/send?phone=+{cleanPhone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
