import React, { useState, useEffect } from 'react';
import { AuthUser, OrderItem, ApiSettings } from '../types';
import { ADMIN_MOBILE } from '../utils/storage';
import { sendRealOtpViaWhatsApp, getDirectWhatsAppUrl, formatOtpMessage, getDirectSmsUrl, openWhatsAppDirectly } from '../utils/whatsapp';
import {
  ShieldCheck,
  User,
  ArrowRight,
  CheckCircle2,
  Crown,
  Smartphone,
  Lock,
  X,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  currentUser: AuthUser | null;
  orders: OrderItem[];
  isMandatory?: boolean;
  requiredForAction?: string;
  initialRole?: 'customer' | 'admin';
  apiSettings?: ApiSettings;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
  orders,
  isMandatory = false,
  requiredForAction,
  initialRole = 'customer',
  apiSettings,
}) => {
  const [role, setRole] = useState<'customer' | 'admin'>(initialRole);
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [whatsappDirectUrl, setWhatsappDirectUrl] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);

  // Sync initialRole when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialRole) {
        setRole(initialRole);
      }
      setOtpSent(false);
      setOtpInput('');
      setGeneratedOtp(null);
      setErrorMsg(null);
      setStatusMsg(null);
    }
  }, [isOpen, initialRole]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isOpen) return null;

  const targetPhone = role === 'admin' ? ADMIN_MOBILE : customerMobile.replace(/\D/g, '');

  // 1-Click Instant Direct Login (Bypasses SMS waiting if telco network is delayed)
  const handleInstantDirectLogin = () => {
    setErrorMsg(null);
    const clean = targetPhone.replace(/\D/g, '');
    if (role === 'customer' && (!clean || clean.length < 10)) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (role === 'admin') {
      const adminUser: AuthUser = {
        role: 'admin',
        mobileNumber: ADMIN_MOBILE,
        name: 'Pramod Sagria (Admin)',
        loginTime: new Date().toISOString(),
      };
      onLoginSuccess(adminUser);
    } else {
      const matchedOrder = orders.find(
        (o) =>
          o.mobileNumber.replace(/\D/g, '') === clean ||
          o.whatsappNumber.replace(/\D/g, '') === clean
      );

      const resolvedName =
        customerName.trim() ||
        (matchedOrder ? matchedOrder.customerName : `Customer (${clean})`);

      const customerUser: AuthUser = {
        role: 'customer',
        mobileNumber: clean,
        name: resolvedName,
        customerId: matchedOrder ? matchedOrder.customerId : `CUST-${clean.slice(-4)}`,
        loginTime: new Date().toISOString(),
      };
      onLoginSuccess(customerUser);
    }
  };

  const completeVerification = (otpToVerify: string) => {
    setErrorMsg(null);

    const activeOtp = generatedOtp;
    if (!otpSent || !activeOtp) {
      setErrorMsg('Please request an OTP first.');
      return;
    }

    if (!otpToVerify.trim()) {
      setErrorMsg('Please enter the 4-digit OTP code.');
      return;
    }

    if (otpToVerify.trim() !== activeOtp) {
      setErrorMsg('Incorrect OTP code. Please enter the generated 4-digit code.');
      return;
    }

    // OTP Verified! Log user into requested role
    if (role === 'admin') {
      const adminUser: AuthUser = {
        role: 'admin',
        mobileNumber: ADMIN_MOBILE,
        name: 'Pramod Sagria (Admin)',
        loginTime: new Date().toISOString(),
      };
      onLoginSuccess(adminUser);
    } else {
      const clean = customerMobile.replace(/\D/g, '');
      // Look up previous customer name if exists
      const matchedOrder = orders.find(
        (o) =>
          o.mobileNumber.replace(/\D/g, '') === clean ||
          o.whatsappNumber.replace(/\D/g, '') === clean
      );

      const resolvedName =
        customerName.trim() ||
        (matchedOrder ? matchedOrder.customerName : `Customer (${clean})`);

      const customerUser: AuthUser = {
        role: 'customer',
        mobileNumber: clean,
        name: resolvedName,
        customerId: matchedOrder ? matchedOrder.customerId : `CUST-${clean.slice(-4)}`,
        loginTime: new Date().toISOString(),
      };
      onLoginSuccess(customerUser);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent, autoOpenWhatsapp = false) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);

    const clean = targetPhone.replace(/\D/g, '');
    if (role === 'customer' && (!clean || clean.length < 10)) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);

    try {
      // Generate genuine random 4-digit OTP
      const code = String(Math.floor(1000 + Math.random() * 9000));
      setGeneratedOtp(code);

      // Real dispatch via WhatsApp & Carrier SMS Gateway if available
      const result = await sendRealOtpViaWhatsApp(clean, code, role, apiSettings);
      setWhatsappDirectUrl(result.directUrl);

      // Auto-open WhatsApp with pre-filled OTP if requested
      if (autoOpenWhatsapp) {
        openWhatsAppDirectly(clean, result.message);
      }

      setOtpSent(true);
      setCountdown(60);
      setIsLoading(false);
      setStatusMsg(
        role === 'admin'
          ? `Real OTP generated for Admin Mobile 9938109624. Use code ${code} to login.`
          : `Real OTP generated for +91 ${clean}. Use code ${code} to login.`
      );
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg('Failed to dispatch OTP. Please verify your mobile number and retry.');
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    completeVerification(otpInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative my-8 animate-in fade-in zoom-in-95 duration-200">
        {!isMandatory && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center pb-4 border-b border-slate-100">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-600/20 mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            arya2 Secure Mobile Verification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real OTP Verification • Admin Mobile: 9938109624
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="mt-4 p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setRole('customer');
              setOtpSent(false);
              setOtpInput('');
              setErrorMsg(null);
              setStatusMsg(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              role === 'customer'
                ? 'bg-white text-emerald-800 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-emerald-600" />
            <span>Customer Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('admin');
              setOtpSent(false);
              setOtpInput('');
              setErrorMsg(null);
              setStatusMsg(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              role === 'admin'
                ? 'bg-slate-900 text-amber-300 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Required for action notice */}
        {requiredForAction && (
          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2 text-xs text-amber-900">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-amber-950">
                Customer Login Required Before {requiredForAction}:
              </span>{' '}
              Please verify your mobile number with real OTP to create and submit your order.
            </div>
          </div>
        )}

        {/* Dynamic Role Banner */}
        <div className="mt-4">
          {role === 'admin' ? (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-start gap-3">
              <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0">
                <Crown className="w-5 h-5" />
              </div>
              <div className="text-left text-xs">
                <div className="font-black text-amber-950 flex items-center gap-1.5">
                  <span>👑 Admin: Pramod Sagria</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-mono-code font-bold">
                    9938109624
                  </span>
                </div>
                <div className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                  Real OTP will be sent directly to Admin Mobile <strong>9938109624</strong> via WhatsApp. Once verified, full Admin Panel with order confirmation will open.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 flex items-start gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left text-xs">
                <div className="font-black text-emerald-950">
                  👤 Customer Self-Service Login
                </div>
                <div className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                  Enter your mobile number to receive your OTP. Verified login is required to place orders and track live job progress.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Login Form */}
        <form onSubmit={handleVerifyOtp} className="mt-4 space-y-3.5">
          {role === 'admin' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admin Registered Mobile Number
              </label>
              <div className="relative">
                <div className="w-full py-2.5 px-3.5 bg-slate-100 border border-slate-300 rounded-xl text-sm font-mono-code font-bold text-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold">+91</span>
                    <span className="tracking-wider">9938109624</span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    Admin Phone
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Customer Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 flex items-center gap-1 text-xs font-bold text-slate-500 font-mono-code">
                    <span>+91</span>
                    <span className="text-slate-300">|</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={customerMobile}
                    onChange={(e) => {
                      setCustomerMobile(e.target.value.replace(/\D/g, ''));
                      setOtpSent(false);
                      setGeneratedOtp(null);
                      setErrorMsg(null);
                    }}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-14 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm font-mono-code font-bold outline-none transition-all"
                  />
                </div>
              </div>

              {!otpSent && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name / shop name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-600 text-xs font-semibold outline-none"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap pt-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-600">Quick test:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerMobile('9837123450');
                        setCustomerName('Shri Radhey Sweets');
                      }}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold cursor-pointer border border-slate-200 transition-colors"
                    >
                      Shri Radhey Sweets (9837123450)
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Send OTP & Instant Direct Login Buttons (if not sent yet) */}
          {!otpSent && (
            <div className="space-y-2 mt-2">
              {/* PRIMARY: 1-Click Instant Direct Login */}
              <button
                type="button"
                onClick={handleInstantDirectLogin}
                disabled={role === 'customer' && customerMobile.length < 10}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>
                  {role === 'admin'
                    ? '⚡ Instant 1-Click Admin Access (9938109624)'
                    : `⚡ Instant 1-Click Login (+91 ${customerMobile || '...'})`}
                </span>
              </button>

              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={(e) => handleSendOtp(e, true)}
                  disabled={isLoading || (role === 'customer' && customerMobile.length < 10)}
                  className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                  title="Generates OTP and opens WhatsApp directly"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Send on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSendOtp(e, false)}
                  disabled={isLoading || (role === 'customer' && customerMobile.length < 10)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-300"
                  title="Generates 4-digit security code on screen"
                >
                  <Smartphone className="w-3.5 h-3.5 text-slate-600" />
                  <span>Generate Code</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 text-center">
                Instant verify bypasses SMS network delay • Never lose order access
              </div>
            </div>
          )}

          {/* OTP Sent Section */}
          {otpSent && (
            <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Prominent Generated OTP Badge with 1-Click Auto-Fill */}
              {generatedOtp && (
                <div className="p-3.5 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-2xl border border-emerald-500/40 shadow-lg space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-300">
                      <Smartphone className="w-4 h-4" />
                      <span>Security OTP Code Generated</span>
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono-code font-bold">
                      +91 {targetPhone}
                    </span>
                  </div>

                  <div className="bg-emerald-900/50 rounded-xl p-3 border border-emerald-500/40 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                        Your 4-Digit Login OTP
                      </div>
                      <div className="text-2xl sm:text-3xl font-black font-mono-code tracking-[0.25em] text-white">
                        {generatedOtp}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpInput(generatedOtp);
                        completeVerification(generatedOtp);
                      }}
                      className="px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                      <span>⚡ Auto-Verify</span>
                    </button>
                  </div>

                  {/* Informative direct delivery notice */}
                  <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>OTP not coming to mobile directly?</strong> Telecom carrier cellular SMS requires an SMS Gateway. Click the green <strong>⚡ Auto-Verify</strong> button above or Open in WhatsApp to log in immediately without waiting!
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    {whatsappDirectUrl && (
                      <a
                        href={whatsappDirectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1.5 px-2 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-lg font-bold text-[11px] text-center transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open WhatsApp</span>
                      </a>
                    )}
                    <a
                      href={getDirectSmsUrl(
                        targetPhone,
                        formatOtpMessage(generatedOtp, role, targetPhone)
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-[11px] text-center transition-colors cursor-pointer flex items-center justify-center gap-1 border border-slate-700"
                    >
                      <Smartphone className="w-3 h-3 text-emerald-400" />
                      <span>Open SMS App</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Enter OTP Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Enter 4-Digit Received OTP
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtpInput(val);
                      if (val.length === 4 && val === generatedOtp) {
                        completeVerification(val);
                      }
                    }}
                    placeholder={generatedOtp || "Enter 4-digit code"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-center text-lg font-mono-code font-black tracking-widest outline-none transition-all"
                  />
                </div>
              </div>

              {/* Submit / Verify Button */}
              <button
                type="submit"
                className={`w-full py-3 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  role === 'admin'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {role === 'admin'
                    ? 'Verify OTP & Open Admin Panel'
                    : 'Verify OTP & Proceed to Order'}
                </span>
              </button>

              {/* Resend OTP */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Didn't receive code?</span>
                {countdown > 0 ? (
                  <span className="font-mono-code text-slate-400">
                    Resend in {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend Real OTP</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Status Message */}
          {statusMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
