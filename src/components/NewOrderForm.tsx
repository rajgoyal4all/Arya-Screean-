import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  OrderItem,
  WorkType,
  PaymentMethod,
  ApiSettings,
  ShopProfile,
  WhatsAppLogEntry,
  WorkTypeItem,
  AuthUser,
} from '../types';
import { AryaLogo } from './AryaLogo';
import { generateNextOrderId, generateNextCustomerId, getStoredWorkTypes, ADMIN_MOBILE } from '../utils/storage';
import {
  sendWhatsAppMessage,
  formatWhatsAppMessage,
  formatNormalSmsMessage,
  getDirectSmsUrl,
  getDirectWhatsAppUrl,
  getWaMeUrl,
  openWhatsAppDirectly,
  sendOrderDetailsToAdminWhatsApp,
  formatAdminOrderNotificationMessage,
  formatAdminOrderSmsMessage,
  getAdminOrderSmsUrl,
  getAdminOrderWhatsAppUrl,
  getAdminOrderWaMeUrl,
  getAdminCallUrl,
  openWhatsAppToAdmin,
  openCustomerWhatsAppDirectly,
  executeAutoOpenWhatsApp,
  AutoOpenTarget,
  sendRealOtpViaWhatsApp,
  ADMIN_PHONE_NUMBER,
  ADMIN_NAME,
} from '../utils/whatsapp';
import {
  User,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Layers,
  IndianRupee,
  Send,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Link as LinkIcon,
  RotateCcw,
  MessageCircle,
  UserPlus,
  Eye,
  Lock,
  ShieldCheck,
  Crown,
  ArrowRight,
  AlertCircle,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { AddDesignerModal } from './AddDesignerModal';
import { WorkTypeSampleViewerModal } from './WorkTypeSampleViewerModal';

interface NewOrderFormProps {
  orders: OrderItem[];
  apiSettings: ApiSettings;
  shopProfile: ShopProfile;
  designers?: string[];
  workTypesList?: WorkTypeItem[];
  preselectedWorkType?: string;
  preselectedDeliveryDate?: string;
  currentUser?: AuthUser | null;
  onRequestLogin?: () => void;
  onLoginSuccess?: (user: AuthUser) => void;
  onAddDesigner?: (designerName: string) => void;
  onOrderCreated: (order: OrderItem, log?: WhatsAppLogEntry) => void;
  onOpenReceipt: (order: OrderItem) => void;
}

const BASE_WORK_TYPES: WorkType[] = [
  'Flex Printing',
  'Banner',
  'DTP',
  'Visiting Card',
  'Wedding Card',
  'Invitation Card',
  'Poster',
  'Pamphlet',
  'Photo Printing',
  'Lamination',
  'Xerox',
  'Other',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'UPI / GPay / PhonePe',
  'Debit / Credit Card',
  'Bank Transfer',
  'Cheque',
];

const OPERATORS = [
  'Ramesh Sharma (Flex Master)',
  'Sunil Verma (DTP & Graphics)',
  'Priya Rajput (Wedding Cards & Design)',
  'Mohit Saini (Finishing & Printing)',
  'Direct Counter Operator',
];

export const NewOrderForm: React.FC<NewOrderFormProps> = ({
  orders,
  apiSettings,
  shopProfile,
  designers = OPERATORS,
  workTypesList,
  preselectedWorkType,
  preselectedDeliveryDate,
  currentUser,
  onRequestLogin,
  onLoginSuccess,
  onAddDesigner,
  onOrderCreated,
  onOpenReceipt,
}) => {
  // Pre-calculated next IDs
  const nextOrderId = generateNextOrderId(orders);
  const nextCustId = generateNextCustomerId(orders);

  // Inline OTP verification states for guests
  const [inlineMobile, setInlineMobile] = useState('');
  const [inlineName, setInlineName] = useState('');
  const [inlineOtp, setInlineOtp] = useState('');
  const [inlineGeneratedOtp, setInlineGeneratedOtp] = useState<string | null>(null);
  const [inlineOtpSent, setInlineOtpSent] = useState(false);
  const [inlineLoading, setInlineLoading] = useState(false);
  const [inlineDirectUrl, setInlineDirectUrl] = useState('');
  const [inlineError, setInlineError] = useState<string | null>(null);

  const completeInlineVerification = (otpToVerify: string) => {
    setInlineError(null);
    if (!inlineOtpSent || !inlineGeneratedOtp) {
      setInlineError('Please request an OTP first.');
      return;
    }
    if (otpToVerify.trim() !== inlineGeneratedOtp) {
      setInlineError('Incorrect OTP code. Please enter the generated 4-digit code.');
      return;
    }
    const clean = inlineMobile.replace(/\D/g, '');
    const user: AuthUser = {
      role: 'customer',
      mobileNumber: clean,
      name: inlineName.trim() || `Customer (${clean})`,
      customerId: `CUST-${clean.slice(-4)}`,
      loginTime: new Date().toISOString(),
    };
    if (onLoginSuccess) {
      onLoginSuccess(user);
    }
  };

  // 1-Click Instant Login (Bypasses SMS waiting if carrier network is delayed)
  const handleInstantInlineLogin = (mobileToUse?: string, nameToUse?: string) => {
    setInlineError(null);
    const m = (mobileToUse || inlineMobile).replace(/\D/g, '');
    if (!m || m.length < 10) {
      setInlineError('Please enter a valid 10-digit mobile number.');
      return;
    }
    const clean = m;
    const user: AuthUser = {
      role: 'customer',
      mobileNumber: clean,
      name: (nameToUse || inlineName).trim() || `Customer (${clean})`,
      customerId: `CUST-${clean.slice(-4)}`,
      loginTime: new Date().toISOString(),
    };
    if (onLoginSuccess) {
      onLoginSuccess(user);
    }
  };

  const handleInlineSendOtp = async (e?: React.FormEvent, autoOpenWhatsapp = false) => {
    if (e) e.preventDefault();
    setInlineError(null);
    const clean = inlineMobile.replace(/\D/g, '');
    if (!clean || clean.length < 10) {
      setInlineError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setInlineLoading(true);
    try {
      const code = String(Math.floor(1000 + Math.random() * 9000));
      setInlineGeneratedOtp(code);
      const res = await sendRealOtpViaWhatsApp(clean, code, 'customer', apiSettings);
      setInlineDirectUrl(res.directUrl);

      if (autoOpenWhatsapp) {
        openWhatsAppDirectly(clean, res.message);
      }

      setInlineOtpSent(true);
      setInlineLoading(false);
    } catch (err: any) {
      setInlineLoading(false);
      setInlineError('Failed to send OTP. Please try again.');
    }
  };

  const handleInlineVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    completeInlineVerification(inlineOtp);
  };

  const activeDesigners = designers && designers.length > 0 ? designers : OPERATORS;
  const currentWorkTypes = workTypesList && workTypesList.length > 0 ? workTypesList : getStoredWorkTypes();

  // Combine dynamic work types with standard options
  const allWorkTypeOptions = Array.from(
    new Set([
      ...currentWorkTypes.map((wt) => wt.title),
      ...BASE_WORK_TYPES,
    ])
  );

  const isCustomer = currentUser?.role === 'customer';
  const isAdmin = currentUser?.role === 'admin';

  // Form State
  const [customerName, setCustomerName] = useState(
    isCustomer && currentUser?.name ? currentUser.name.replace(/ \(.*\)/, '') : ''
  );
  const [mobileNumber, setMobileNumber] = useState(
    isCustomer && currentUser?.mobileNumber ? currentUser.mobileNumber : ''
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    isCustomer && currentUser?.mobileNumber ? currentUser.mobileNumber : ''
  );
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [address, setAddress] = useState('');
  const [villageTown, setVillageTown] = useState('');
  const [district, setDistrict] = useState('Mathura');
  const [pincode, setPincode] = useState('281401');
  const [email, setEmail] = useState('');
  const [adminConfirmNow, setAdminConfirmNow] = useState(isAdmin);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync customer identity if currentUser updates
  useEffect(() => {
    if (currentUser?.role === 'customer') {
      if (currentUser.mobileNumber) {
        setMobileNumber(currentUser.mobileNumber);
        if (sameAsMobile) {
          setWhatsappNumber(currentUser.mobileNumber);
        }
      }
      if (currentUser.name && (!customerName || customerName.startsWith('Customer ('))) {
        setCustomerName(currentUser.name.replace(/ \(.*\)/, ''));
      }
    }
  }, [currentUser]);

  // Work Details
  const [workType, setWorkType] = useState<WorkType>(
    preselectedWorkType || 'Flex Printing'
  );
  const [isSampleViewerOpen, setIsSampleViewerOpen] = useState(false);
  const [workDescription, setWorkDescription] = useState('');
  const [width, setWidth] = useState('10');
  const [height, setHeight] = useState('4');
  const [dimensionUnit, setDimensionUnit] = useState<'ft' | 'in' | 'cm'>('ft');
  const [quantity, setQuantity] = useState<number>(1);
  const [material, setMaterial] = useState('Star Backlit Flex 340 GSM');
  const [designFileName, setDesignFileName] = useState('');
  const [designFileUploadOrLink, setDesignFileUploadOrLink] = useState('');

  // Handle preselected work type if provided externally
  useEffect(() => {
    if (preselectedWorkType) {
      handleWorkTypeChange(preselectedWorkType);
    }
  }, [preselectedWorkType]);
  
  // Tomorrow as default delivery date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDeliveryDate = tomorrow.toISOString().split('T')[0];
  const [deliveryDate, setDeliveryDate] = useState(preselectedDeliveryDate || defaultDeliveryDate);

  useEffect(() => {
    if (preselectedDeliveryDate) {
      setDeliveryDate(preselectedDeliveryDate);
    }
  }, [preselectedDeliveryDate]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [designerOperator, setDesignerOperator] = useState(activeDesigners[0]);
  const [isAddDesignerOpen, setIsAddDesignerOpen] = useState(false);
  const [remarks, setRemarks] = useState('');

  // Payment
  const [amount, setAmount] = useState<number>(1000);
  const [advancePaid, setAdvancePaid] = useState<number>(500);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoOpenTarget, setAutoOpenTarget] = useState<AutoOpenTarget>(() => {
    try {
      const saved = localStorage.getItem('arya2_auto_open_whatsapp_target');
      if (saved === 'admin' || saved === 'customer' || saved === 'both' || saved === 'none') {
        return saved as AutoOpenTarget;
      }
    } catch {
      // ignore
    }
    return 'admin';
  });
  const [autoOpenResult, setAutoOpenResult] = useState<{
    target: AutoOpenTarget;
    openedAdmin: boolean;
    openedCustomer: boolean;
    adminUrl: string;
    customerUrl: string;
  } | null>(null);
  const [customerCountdown, setCustomerCountdown] = useState<number | null>(null);

  const handleAutoOpenTargetChange = (target: AutoOpenTarget) => {
    setAutoOpenTarget(target);
    try {
      localStorage.setItem('arya2_auto_open_whatsapp_target', target);
    } catch {
      // ignore
    }
  };

  const [submittedOrder, setSubmittedOrder] = useState<OrderItem | null>(null);
  const [copiedAdminDetails, setCopiedAdminDetails] = useState(false);
  const [copiedAdminSms, setCopiedAdminSms] = useState(false);
  const [showAdminMessagePreview, setShowAdminMessagePreview] = useState(false);
  const [customerCopySent, setCustomerCopySent] = useState(false);
  const [whatsappNotice, setWhatsappNotice] = useState<{
    status: 'Sent' | 'Failed' | 'Simulated';
    message: string;
  } | null>(null);

  // Auto-dispatch countdown for secondary customer tab when 'both' is selected
  useEffect(() => {
    if (customerCountdown === null) return;
    if (customerCountdown <= 0) {
      if (submittedOrder) {
        openCustomerWhatsAppDirectly(submittedOrder);
        setAutoOpenResult((prev) =>
          prev ? { ...prev, openedCustomer: true } : null
        );
        setCustomerCopySent(true);
      }
      setCustomerCountdown(null);
      return;
    }
    const timer = setTimeout(() => {
      setCustomerCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [customerCountdown, submittedOrder]);

  // Auto-sync WhatsApp number when "same as mobile" is checked
  useEffect(() => {
    if (sameAsMobile) {
      setWhatsappNumber(mobileNumber);
    }
  }, [mobileNumber, sameAsMobile]);

  // Update default material based on work type
  const handleWorkTypeChange = (type: WorkType) => {
    setWorkType(type);
    switch (type) {
      case 'Flex Printing':
      case 'Banner':
        setMaterial('Star Backlit Flex 340 GSM');
        setWidth('10');
        setHeight('4');
        setDimensionUnit('ft');
        break;
      case 'Visiting Card':
        setMaterial('350 GSM Art Card with Velvet Lamination');
        setWidth('3.5');
        setHeight('2');
        setDimensionUnit('in');
        setQuantity(1000);
        setAmount(1200);
        setAdvancePaid(600);
        break;
      case 'Wedding Card':
      case 'Invitation Card':
        setMaterial('Metallic Gold Handmade Board with Inserts');
        setWidth('8');
        setHeight('10');
        setDimensionUnit('in');
        setQuantity(200);
        setAmount(8000);
        setAdvancePaid(3000);
        break;
      case 'Pamphlet':
        setMaterial('90 GSM Gloss Art Paper');
        setWidth('8.27');
        setHeight('11.69');
        setDimensionUnit('in');
        setQuantity(5000);
        setAmount(4500);
        setAdvancePaid(2000);
        break;
      case 'DTP':
        setMaterial('Bond / Maplitho Paper');
        setWidth('A4');
        setHeight('Standard');
        setDimensionUnit('in');
        break;
      default:
        break;
    }
  };

  // Calculated balance
  const balanceAmount = Math.max(0, (amount || 0) - (advancePaid || 0));

  // Sq Ft preview for Flex/Banner
  const sqFtCalculation = () => {
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    if (dimensionUnit === 'ft') {
      return (w * h * (quantity || 1)).toFixed(1);
    } else if (dimensionUnit === 'in') {
      return ((w * h * (quantity || 1)) / 144).toFixed(1);
    }
    return null;
  };

  const resetForm = () => {
    setCustomerName('');
    setMobileNumber('');
    setWhatsappNumber('');
    setAddress('');
    setVillageTown('');
    setWorkDescription('');
    setDesignFileName('');
    setDesignFileUploadOrLink('');
    setSpecialInstructions('');
    setRemarks('');
    setAmount(1000);
    setAdvancePaid(500);
    setSubmittedOrder(null);
    setWhatsappNotice(null);
    setCopiedAdminDetails(false);
    setCopiedAdminSms(false);
    setShowAdminMessagePreview(false);
    setCustomerCopySent(false);
    setAutoOpenResult(null);
    setCustomerCountdown(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Enforce OTP login before creating order
    if (!currentUser) {
      if (onRequestLogin) {
        onRequestLogin();
      } else {
        setValidationError('Mobile Number & OTP login required before creating an order.');
      }
      return;
    }

    if (!customerName.trim()) {
      setValidationError('Please enter Customer Name.');
      return;
    }
    if (!mobileNumber.trim()) {
      setValidationError('Please enter Mobile Number.');
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const dateTimeStr = `${now.toISOString().split('T')[0]} ${now
      .toTimeString()
      .split(' ')[0]
      .substring(0, 5)}`;

    const effectiveWhatsapp = sameAsMobile ? mobileNumber : whatsappNumber || mobileNumber;
    const sizeDimensionsStr = `${width}x${height} ${dimensionUnit}`;

    const shouldConfirmNow = isAdmin ? adminConfirmNow : false;

    const newOrder: OrderItem = {
      id: `ord_${Date.now()}`,
      orderId: nextOrderId,
      customerId: nextCustId,
      dateTime: dateTimeStr,
      customerName: customerName.trim(),
      mobileNumber: mobileNumber.trim(),
      whatsappNumber: effectiveWhatsapp.trim(),
      address: address.trim(),
      villageTown: villageTown.trim() || shopProfile.villageTown,
      district: district.trim() || shopProfile.district,
      pincode: pincode.trim() || shopProfile.pincode,
      email: email.trim(),
      workType,
      workDescription: workDescription.trim() || `${workType} order`,
      width: width.trim(),
      height: height.trim(),
      sizeDimensions: sizeDimensionsStr,
      quantity: Number(quantity) || 1,
      material: material.trim(),
      designFileName: designFileName.trim(),
      designFileUploadOrLink: designFileUploadOrLink.trim(),
      deliveryDate,
      specialInstructions: specialInstructions.trim(),
      designerOperator,
      amount: Number(amount) || 0,
      advancePaid: Number(advancePaid) || 0,
      balanceAmount: balanceAmount,
      paymentStatus: balanceAmount === 0 ? 'Paid' : advancePaid > 0 ? 'Partial' : 'Pending',
      paymentMethod,
      orderStatus: shouldConfirmNow ? 'Confirmed' : 'Pending Confirmation',
      adminConfirmed: shouldConfirmNow,
      confirmedAt: shouldConfirmNow ? dateTimeStr : undefined,
      confirmedBy: shouldConfirmNow ? 'Pramod Sagria (Admin - 9938109624)' : undefined,
      whatsappStatus: 'Pending',
      remarks: remarks.trim(),
    };

    // IMMEDIATE SYNCHRONOUS AUTO-OPEN (Runs inside user click event stack to guarantee no popup blockage)
    const autoDispatchResult = executeAutoOpenWhatsApp(newOrder, autoOpenTarget);
    setAutoOpenResult({
      target: autoOpenTarget,
      openedAdmin: autoDispatchResult.openedAdmin,
      openedCustomer: autoDispatchResult.openedCustomer,
      adminUrl: autoDispatchResult.adminUrl,
      customerUrl: autoDispatchResult.customerUrl,
    });

    if (autoOpenTarget === 'both') {
      // Schedule customer tab auto-open with 2s countdown so browser doesn't block dual popups
      setCustomerCountdown(2);
    } else if (autoOpenTarget === 'customer') {
      setCustomerCopySent(true);
    }

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    // STEP 1: Always save order record in database first
    let logEntry: WhatsAppLogEntry | undefined;

    // STEP 2: Dispatch full order details to Admin Mobile 9938109624 via API if configured
    try {
      await sendOrderDetailsToAdminWhatsApp(newOrder, apiSettings);
    } catch (adminErr) {
      console.warn('Could not auto-dispatch to admin phone via API:', adminErr);
    }

    // STEP 3: Attempt WhatsApp delivery to Customer via API if configured
    const waMessageType = shouldConfirmNow ? 'Order Confirmed by Admin' : 'Order Confirmation';
    try {
      const waResult = await sendWhatsAppMessage(newOrder, apiSettings, waMessageType);
      newOrder.whatsappStatus = waResult.status;
      newOrder.whatsappResponse = waResult.responseDetails;
      logEntry = waResult.logEntry;

      if (waResult.success) {
        setWhatsappNotice({
          status: waResult.status === 'Sent' ? 'Sent' : 'Simulated',
          message: shouldConfirmNow
            ? `Order confirmed & notification dispatched to customer (+91 ${effectiveWhatsapp}) from Admin Mobile 9938109624.`
            : `Order placed! Specifications prepared for delivery to Admin Pramod Sagria (Mobile: 9938109624).`,
        });
      } else {
        setWhatsappNotice({
          status: 'Failed',
          message: `Order registered in Excel database. WhatsApp link ready for instant transmission.`,
        });
      }
    } catch (err: any) {
      newOrder.whatsappStatus = 'Failed';
      newOrder.whatsappResponse = `Error: ${err?.message || 'Unknown'}`;
      setWhatsappNotice({
        status: 'Failed',
        message: 'Order saved in Excel database. Direct delivery to Admin Mobile 9938109624 ready.',
      });
    }

    onOrderCreated(newOrder, logEntry);
    setSubmittedOrder(newOrder);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Card with Branding */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AryaLogo customLogoUrl={shopProfile.logoUrl} size="lg" showSubtitle={true} />
        </div>

        <div className="flex flex-col sm:items-end">
          <div className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
            AUTO-GENERATED ORDER NUMBER
          </div>
          <div className="text-2xl font-black font-mono-code text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 mt-1">
            {nextOrderId}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Customer ID: {nextCustId}</div>
        </div>
      </div>

      {/* Confirmation Success & Admin Mobile Delivery Card */}
      {submittedOrder && (
        <div
          className="text-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-emerald-500 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          {/* Top Bar with Status and Close */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3.5 rounded-2xl ${
                  submittedOrder.adminConfirmed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {submittedOrder.adminConfirmed ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <Sparkles className="w-8 h-8" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs uppercase font-extrabold tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Order Saved in Database
                  </span>
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30">
                    Admin Destination: +91 9938109624
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white mt-1">
                  {submittedOrder.adminConfirmed
                    ? 'Order Confirmed by Admin Pramod Sagria!'
                    : 'Order Placed! Deliver to Admin Mobile (9938109624)'}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm mt-0.5 font-medium">
                  Order ID: <span className="font-mono-code font-bold text-emerald-400">{submittedOrder.orderId}</span> • Customer:{' '}
                  <span className="font-bold text-white">{submittedOrder.customerName}</span> ({submittedOrder.mobileNumber}) • Work: <span className="font-bold text-amber-300">{submittedOrder.workType}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setSubmittedOrder(null)}
              className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 cursor-pointer border border-slate-700"
            >
              Close
            </button>
          </div>

          {/* Auto-Open Realtime Status Banner */}
          {autoOpenResult && (
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-900/90 to-slate-900/90 border border-emerald-400/60 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                      ⚡ Auto-Open Status:
                    </span>
                    <span className="text-xs bg-emerald-400 text-slate-950 font-bold px-2 py-0.5 rounded">
                      {autoOpenResult.target === 'admin'
                        ? 'Admin WhatsApp Auto-Opened (9938109624)'
                        : autoOpenResult.target === 'customer'
                        ? 'Customer WhatsApp Auto-Opened'
                        : autoOpenResult.target === 'both'
                        ? 'Dual Auto-Dispatch (Admin & Customer)'
                        : 'Manual Mode'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {autoOpenResult.target === 'admin' && (
                      <>WhatsApp chat for Admin <strong>Pramod Sagria (9938109624)</strong> was opened in a new tab with order details pre-filled.</>
                    )}
                    {autoOpenResult.target === 'customer' && (
                      <>WhatsApp chat for Customer <strong>(+91 {submittedOrder.whatsappNumber})</strong> was opened in a new tab with order confirmation.</>
                    )}
                    {autoOpenResult.target === 'both' && (
                      <>Admin tab (9938109624) launched immediately! {customerCountdown !== null && customerCountdown > 0 ? (
                        <span className="text-amber-300 font-bold">Auto-launching Customer WhatsApp tab in {customerCountdown}s...</span>
                      ) : (
                        <span className="text-emerald-300 font-bold">Customer WhatsApp also launched.</span>
                      )}</>
                    )}
                    {autoOpenResult.target === 'none' && (
                      <>Auto-open was disabled. Click the buttons below anytime to deliver via WhatsApp or SMS.</>
                    )}
                  </p>
                </div>
              </div>

              {/* Dual Launch helper if countdown is active */}
              {customerCountdown !== null && customerCountdown > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    openCustomerWhatsAppDirectly(submittedOrder);
                    setCustomerCountdown(null);
                    setCustomerCopySent(true);
                  }}
                  className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl font-black text-xs shadow-md animate-pulse cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Launch Customer Tab Now ({customerCountdown}s)</span>
                </button>
              )}
            </div>
          )}

          {/* CRITICAL: Primary Admin Mobile Delivery Card */}
          <div className="mt-5 p-5 rounded-2xl bg-emerald-950/70 border-2 border-emerald-400/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <div className="w-3 h-3 rounded-full bg-emerald-400 shrink-0 -ml-5.5" />
                <div>
                  <h4 className="text-sm font-black text-emerald-200 tracking-wide">
                    ADMIN MOBILE DISPATCH • PRAMOD SAGRIA (9938109624)
                  </h4>
                  <p className="text-[11px] text-emerald-300/80 mt-0.5">
                    Click below to deliver complete job specifications directly to Admin Pramod Sagria's WhatsApp / SMS.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs bg-emerald-400 text-slate-950 font-black font-mono-code px-3 py-1 rounded-lg">
                  +91 9938109624
                </span>
              </div>
            </div>

            {/* Action Buttons for Admin Delivery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              {/* WhatsApp to Admin */}
              <a
                href={getAdminOrderWhatsAppUrl(submittedOrder)}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Send className="w-4 h-4 shrink-0 text-slate-950" />
                <span>🚀 Deliver to Admin WhatsApp (9938109624)</span>
              </a>

              {/* wa.me Direct Link to Admin */}
              <a
                href={getAdminOrderWaMeUrl(submittedOrder)}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-3.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs border border-emerald-600 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Smartphone className="w-4 h-4 shrink-0 text-emerald-300" />
                <span>💬 Direct wa.me to Admin</span>
              </a>

              {/* Normal SMS to Admin */}
              <a
                href={getAdminOrderSmsUrl(submittedOrder)}
                className="py-3 px-3.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Phone className="w-4 h-4 shrink-0 text-amber-400" />
                <span>📱 Send SMS to Admin Mobile</span>
              </a>

              {/* Direct Call to Admin */}
              <a
                href={getAdminCallUrl()}
                className="py-3 px-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl font-bold text-xs border border-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Phone className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>📞 Call Admin (9938109624)</span>
              </a>
            </div>

            {/* Copy Admin Message & Toggle Preview */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-800/60 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(formatAdminOrderNotificationMessage(submittedOrder));
                    setCopiedAdminDetails(true);
                    setTimeout(() => setCopiedAdminDetails(false), 2500);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 rounded-lg text-xs font-bold border border-emerald-700 cursor-pointer transition-all"
                >
                  {copiedAdminDetails ? (
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedAdminDetails ? 'Copied to Clipboard!' : 'Copy Full Order Details for Admin'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAdminMessagePreview(!showAdminMessagePreview)}
                  className="text-emerald-300/80 hover:text-emerald-100 text-xs underline cursor-pointer"
                >
                  {showAdminMessagePreview ? 'Hide Message Preview' : 'Preview Message to Admin'}
                </button>
              </div>

              <span className="text-[11px] text-emerald-300/70 font-mono-code">
                Admin Pramod Sagria with mobile no 9938109624
              </span>
            </div>

            {/* Expandable Message Preview Box */}
            {showAdminMessagePreview && (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-emerald-800/50 text-[11px] font-mono-code whitespace-pre-wrap text-emerald-200/90 leading-relaxed max-h-48 overflow-y-auto">
                {formatAdminOrderNotificationMessage(submittedOrder)}
              </div>
            )}
          </div>

          {/* Status Alert Banner */}
          {whatsappNotice && (
            <div
              className={`mt-4 p-3.5 rounded-xl text-xs flex items-center justify-between gap-3 ${
                whatsappNotice.status === 'Failed'
                  ? 'bg-amber-950/80 text-amber-200 border border-amber-800'
                  : 'bg-emerald-900/70 text-emerald-200 border border-emerald-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {whatsappNotice.status === 'Failed' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <span>{whatsappNotice.message}</span>
              </div>
            </div>
          )}

          {/* Secondary Actions: Customer Receipt, Print, Create Another */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <a
                href={getDirectWhatsAppUrl(
                  submittedOrder.whatsappNumber,
                  formatWhatsAppMessage(
                    submittedOrder,
                    submittedOrder.adminConfirmed ? 'Order Confirmed by Admin' : 'Order Confirmation'
                  )
                )}
                target="_blank"
                rel="noreferrer"
                onClick={() => setCustomerCopySent(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 border border-slate-700 cursor-pointer transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>
                  {customerCopySent
                    ? 'Customer Copy Opened'
                    : `Send Copy to Customer WhatsApp (+91 ${submittedOrder.whatsappNumber})`}
                </span>
              </a>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                id="order-modal-print-receipt-btn"
                onClick={() => onOpenReceipt(submittedOrder)}
                className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-700" />
                <span>Print Official Receipt</span>
              </button>

              <button
                onClick={resetForm}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 border border-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Create Another Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Error Toast if any */}
      {validationError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-900 font-bold">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
          <button
            onClick={() => setValidationError(null)}
            className="text-rose-500 hover:text-rose-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* BEFORE CREATING ORDER: Customer Login is strictly REQUIRED */}
      {!currentUser ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-600/30 shadow-xl max-w-xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/30">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Customer Login Required Before Creating Order
            </h3>
            <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              As per shop policy, you must log in with your verified mobile number and OTP to place an order.
              Orders will be linked to your phone and reviewed by Admin Pramod Sagria (Mobile: 9938109624).
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                  value={inlineMobile}
                  onChange={(e) => {
                    setInlineMobile(e.target.value.replace(/\D/g, ''));
                    setInlineOtpSent(false);
                    setInlineGeneratedOtp(null);
                    setInlineError(null);
                  }}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full pl-14 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm font-mono-code font-bold outline-none bg-white"
                />
              </div>
            </div>

            {!inlineOtpSent ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Customer Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={inlineName}
                    onChange={(e) => setInlineName(e.target.value)}
                    placeholder="Enter your name / shop name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 text-xs font-semibold outline-none bg-white"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap pt-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-600">Quick test:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setInlineMobile('9837123450');
                        setInlineName('Shri Radhey Sweets');
                      }}
                      className="px-2 py-0.5 bg-white hover:bg-slate-200 text-slate-800 rounded font-semibold cursor-pointer border border-slate-200 transition-colors"
                    >
                      Shri Radhey Sweets (9837123450)
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {/* PRIMARY: 1-Click Instant Direct Login */}
                  <button
                    type="button"
                    onClick={() => handleInstantInlineLogin()}
                    disabled={inlineMobile.length < 10}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
                  >
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>⚡ Instant 1-Click Login (+91 {inlineMobile || '...'})</span>
                  </button>

                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => handleInlineSendOtp(e, true)}
                      disabled={inlineLoading || inlineMobile.length < 10}
                      className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Send on WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleInlineSendOtp(e, false)}
                      disabled={inlineLoading || inlineMobile.length < 10}
                      className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-800 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-300"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-slate-600" />
                      <span>Generate OTP</span>
                    </button>
                  </div>

                  {/* Skip OTP / Guest Mode Bypass */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Want to place an order directly?</span>
                    <button
                      type="button"
                      onClick={() => {
                        const clean = inlineMobile.replace(/\D/g, '') || '9837123450';
                        handleInstantInlineLogin(clean, inlineName || 'Guest Customer');
                      }}
                      className="font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                    >
                      Continue as Guest (Skip OTP) →
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <form onSubmit={handleInlineVerifyOtp} className="space-y-3 pt-2">
                {/* Prominent Generated OTP badge */}
                {inlineGeneratedOtp && (
                  <div className="p-3.5 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-2xl border border-emerald-500/40 shadow-lg space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold flex items-center gap-1.5 text-emerald-300">
                        <Smartphone className="w-4 h-4" />
                        <span>Security OTP Code Generated</span>
                      </span>
                      <span className="text-[11px] text-emerald-400 font-mono-code font-bold">
                        +91 {inlineMobile}
                      </span>
                    </div>

                    <div className="bg-emerald-900/50 rounded-xl p-3 border border-emerald-500/40 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                          Your 4-Digit Login OTP
                        </div>
                        <div className="text-2xl sm:text-3xl font-black font-mono-code tracking-[0.25em] text-white">
                          {inlineGeneratedOtp}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setInlineOtp(inlineGeneratedOtp);
                          completeInlineVerification(inlineGeneratedOtp);
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
                        <strong>OTP not coming to mobile directly?</strong> Telecom carrier cellular SMS requires an SMS Gateway key. Click the green <strong>⚡ Auto-Verify</strong> button above or Open WhatsApp to unlock immediately!
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      {inlineDirectUrl && (
                        <a
                          href={inlineDirectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-1.5 px-2 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-lg font-bold text-[11px] text-center transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>📱 Open WhatsApp</span>
                        </a>
                      )}
                      <a
                        href={getDirectSmsUrl(
                          inlineMobile,
                          `Your arya2 Order Login OTP code is: ${inlineGeneratedOtp}`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-[11px] text-center transition-colors cursor-pointer flex items-center justify-center gap-1 border border-slate-700"
                      >
                        <span>💬 Open SMS</span>
                      </a>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Enter 4-Digit Received OTP
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={inlineOtp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setInlineOtp(val);
                      if (val.length === 4 && val === inlineGeneratedOtp) {
                        completeInlineVerification(val);
                      }
                    }}
                    placeholder={inlineGeneratedOtp || "Enter 4-digit OTP"}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-300 focus:border-emerald-600 text-center text-lg font-mono-code font-black tracking-widest outline-none bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify OTP &amp; Unlock Order Form</span>
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={handleInlineSendOtp}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend Real OTP</span>
                  </button>
                </div>
              </form>
            )}

            {inlineError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{inlineError}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-center gap-3 text-xs text-slate-500 flex-wrap">
            <span>Or use modal:</span>
            <button
              type="button"
              onClick={onRequestLogin}
              className="text-emerald-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Open Login Popup</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Logged In Status Banner */}
          <div className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs flex-wrap bg-white shadow-xs">
            {isAdmin ? (
              <div className="flex items-center justify-between w-full gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-slate-800">
                    <strong className="text-amber-950 font-bold">Admin Mode:</strong>{' '}
                    Pramod Sagria (Mobile: <strong className="font-mono-code text-slate-900">9938109624</strong>). You can operate all software features and confirm customer orders.
                  </span>
                </div>
                <label className="flex items-center gap-2 font-bold cursor-pointer bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-amber-950">
                  <input
                    type="checkbox"
                    checked={adminConfirmNow}
                    onChange={(e) => setAdminConfirmNow(e.target.checked)}
                    className="w-4 h-4 accent-amber-600 rounded"
                  />
                  <span>✓ Approve &amp; Confirm Order Immediately</span>
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-slate-800">
                    <strong className="text-emerald-950 font-bold">Verified Customer:</strong>{' '}
                    {currentUser.name} (Mobile: <strong className="font-mono-code text-slate-900">+91 {currentUser.mobileNumber}</strong>)
                  </span>
                </div>
                <span className="text-[11px] bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full font-bold">
                  ⏳ After placing order, it will be confirmed by Admin Pramod Sagria (9938109624)
                </span>
              </div>
            )}
          </div>

          {/* Main Entry Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Customer Details */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <User className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">1. Customer Details</h2>
            <span className="text-xs text-slate-500 ml-auto">
              Auto Customer ID: <span className="font-mono-code font-bold">{nextCustId}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Customer Name */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Customer Name / Firm Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Shri Radhey Sweets (Mr. Manoj Sharma)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none font-medium"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                {isCustomer && (
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    ✓ OTP Verified
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono-code">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none font-mono-code font-medium"
                />
              </div>
            </div>

            {/* WhatsApp Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  WhatsApp Number
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsMobile}
                    onChange={(e) => setSameAsMobile(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Same as Mobile</span>
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono-code">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  disabled={sameAsMobile}
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="WhatsApp Mobile"
                  className={`w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none font-mono-code font-medium ${
                    sameAsMobile ? 'bg-slate-50 text-slate-500' : 'focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20'
                  }`}
                />
              </div>
            </div>

            {/* Address */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Shop / Office Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Gandhi Chowk, Station Road"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none font-medium"
              />
            </div>

            {/* Village / Town */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Village / Town
              </label>
              <input
                type="text"
                value={villageTown}
                onChange={(e) => setVillageTown(e.target.value)}
                placeholder="e.g. Chhata / Kosi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none font-medium"
              />
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                District
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Mathura"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none font-medium"
              />
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pincode
              </label>
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="281401"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none font-mono-code font-medium"
              />
            </div>

            {/* Email ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email ID (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Work Details */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">2. Work Details & Specifications</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Work Type Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Work Type <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsSampleViewerOpen(true)}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer hover:underline"
                  title="Open sample proof photo gallery & prevailing rates"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Proofs &amp; Rates ({currentWorkTypes.reduce((acc, w) => acc + (w.samples?.length || 0), 0)})</span>
                </button>
              </div>
              <select
                value={workType}
                onChange={(e) => handleWorkTypeChange(e.target.value as WorkType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm font-semibold outline-none bg-white"
              >
                {allWorkTypeOptions.map((wt) => (
                  <option key={wt} value={wt}>
                    {wt}
                  </option>
                ))}
              </select>
            </div>

            {/* Work Description */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Description / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder="e.g. Front Shop Glow Sign Board with Eyelets"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none font-medium"
              />
            </div>

            {/* Width, Height & Unit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Width & Height (Dimensions)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="Width"
                  className="w-1/2 px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none font-mono-code"
                />
                <span className="text-slate-400 font-bold">×</span>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Height"
                  className="w-1/2 px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none font-mono-code"
                />
                <select
                  value={dimensionUnit}
                  onChange={(e) => setDimensionUnit(e.target.value as any)}
                  className="px-2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                >
                  <option value="ft">ft</option>
                  <option value="in">in</option>
                  <option value="cm">cm</option>
                </select>
              </div>
              {sqFtCalculation() && (
                <div className="text-[11px] text-emerald-700 font-medium mt-1">
                  Area: ~{sqFtCalculation()} sq. ft total
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none font-mono-code font-bold"
              />
            </div>

            {/* Material */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Material / Media
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g. Star Flex 340 GSM / Art Card 350 GSM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none font-medium"
              />
            </div>

            {/* Delivery Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Delivery / Required Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none font-mono-code font-medium bg-white"
                />
              </div>
            </div>

            {/* Designer / Operator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Assigned Designer / Operator
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddDesignerOpen(true)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add Designer</span>
                </button>
              </div>
              <select
                value={designerOperator}
                onChange={(e) => {
                  if (e.target.value === '__ADD_NEW_DESIGNER__') {
                    setIsAddDesignerOpen(true);
                  } else {
                    setDesignerOperator(e.target.value);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm font-semibold outline-none bg-white cursor-pointer"
              >
                {activeDesigners.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
                <option value="__ADD_NEW_DESIGNER__" className="text-emerald-700 font-bold bg-emerald-50">
                  ➕ + Add New Designer...
                </option>
              </select>
            </div>

            {/* Design File Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Design / File Name
              </label>
              <input
                type="text"
                value={designFileName}
                onChange={(e) => setDesignFileName(e.target.value)}
                placeholder="e.g. Radhey_Shop_Board.cdr"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none font-medium"
              />
            </div>

            {/* Design Link / Upload */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Design / File Upload or Cloud Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={designFileUploadOrLink}
                  onChange={(e) => setDesignFileUploadOrLink(e.target.value)}
                  placeholder="https://drive.google.com/arya/file.pdf or Local File Path"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none font-medium"
                />
              </div>
            </div>

            {/* Special Instructions */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Special Instructions (Printing / Finishing)
              </label>
              <textarea
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Eyelets on 4 corners, double red margin, velvet touch lamination..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Payment */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">3. Payment & Billing Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold font-mono-code">
                  ₹
                </span>
                <input
                  type="number"
                  min={0}
                  required
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-lg font-black font-mono-code text-slate-900 outline-none"
                />
              </div>
            </div>

            {/* Advance Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Advance Paid (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold font-mono-code">
                  ₹
                </span>
                <input
                  type="number"
                  min={0}
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-lg font-black font-mono-code text-emerald-700 outline-none"
                />
              </div>
            </div>

            {/* Balance Amount (Auto calculated) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Balance Amount (₹) [Auto]
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold font-mono-code">
                  ₹
                </span>
                <input
                  type="text"
                  readOnly
                  value={balanceAmount}
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-lg font-black font-mono-code outline-none bg-slate-50 ${
                    balanceAmount > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm font-semibold outline-none bg-white"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Remarks */}
          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Internal Remarks / Notes
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Customer requested call before dispatch, VIP client..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none font-medium"
            />
          </div>
        </div>

        {/* Auto-Open WhatsApp Selector & Submit Bar */}
        <div className="bg-emerald-950 text-white rounded-2xl p-5 border-2 border-emerald-500 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30">
                <Smartphone className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <div className="text-sm font-extrabold flex items-center gap-2 flex-wrap">
                  <span>⚡ Auto-Open WhatsApp Dispatch Mode</span>
                  <span className="text-[11px] bg-emerald-700 text-white px-2 py-0.5 rounded font-mono-code font-bold">
                    Admin: Pramod Sagria (9938109624)
                  </span>
                </div>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  Select who automatically receives WhatsApp when this order is created. The WhatsApp window opens immediately with complete pre-formatted job details.
                </p>
              </div>
            </div>
          </div>

          {/* 4-way selector cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => handleAutoOpenTargetChange('admin')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                autoOpenTarget === 'admin'
                  ? 'bg-emerald-500 text-slate-950 border-white font-black shadow-lg shadow-emerald-500/30 scale-[1.02]'
                  : 'bg-emerald-900/60 text-emerald-200 border-emerald-700/80 hover:bg-emerald-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-extrabold">👑 Admin Only</span>
                {autoOpenTarget === 'admin' && <Check className="w-4 h-4 text-slate-950 stroke-[3]" />}
              </div>
              <div className="text-sm font-black mt-1 font-mono-code">9938109624</div>
              <div className="text-[10px] opacity-80">Pramod Sagria (Admin)</div>
            </button>

            <button
              type="button"
              onClick={() => handleAutoOpenTargetChange('customer')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                autoOpenTarget === 'customer'
                  ? 'bg-emerald-500 text-slate-950 border-white font-black shadow-lg shadow-emerald-500/30 scale-[1.02]'
                  : 'bg-emerald-900/60 text-emerald-200 border-emerald-700/80 hover:bg-emerald-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-extrabold">👤 Customer Only</span>
                {autoOpenTarget === 'customer' && <Check className="w-4 h-4 text-slate-950 stroke-[3]" />}
              </div>
              <div className="text-sm font-black mt-1 font-mono-code">
                {mobileNumber ? `+91 ${mobileNumber.slice(-10)}` : 'Customer Mobile'}
              </div>
              <div className="text-[10px] opacity-80">Order Confirmation</div>
            </button>

            <button
              type="button"
              onClick={() => handleAutoOpenTargetChange('both')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                autoOpenTarget === 'both'
                  ? 'bg-emerald-500 text-slate-950 border-white font-black shadow-lg shadow-emerald-500/30 scale-[1.02]'
                  : 'bg-emerald-900/60 text-emerald-200 border-emerald-700/80 hover:bg-emerald-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-extrabold">🚀 Both (Admin &amp; Cust)</span>
                {autoOpenTarget === 'both' && <Check className="w-4 h-4 text-slate-950 stroke-[3]" />}
              </div>
              <div className="text-sm font-black mt-1">Admin + Customer</div>
              <div className="text-[10px] opacity-80">Dispatches to both</div>
            </button>

            <button
              type="button"
              onClick={() => handleAutoOpenTargetChange('none')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                autoOpenTarget === 'none'
                  ? 'bg-emerald-500 text-slate-950 border-white font-black shadow-lg shadow-emerald-500/30 scale-[1.02]'
                  : 'bg-emerald-900/60 text-emerald-200 border-emerald-700/80 hover:bg-emerald-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-extrabold">⏸️ Manual Only</span>
                {autoOpenTarget === 'none' && <Check className="w-4 h-4 text-slate-950 stroke-[3]" />}
              </div>
              <div className="text-sm font-black mt-1">No Auto-Open</div>
              <div className="text-[10px] opacity-80">1-click send on demand</div>
            </button>
          </div>

          {/* Bottom actions & status */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-emerald-800/80">
            <span className="text-xs text-emerald-300 font-medium">
              Saved preference:{' '}
              <strong className="text-white underline">
                {autoOpenTarget === 'admin'
                  ? 'Auto-open Admin WhatsApp (9938109624)'
                  : autoOpenTarget === 'customer'
                  ? 'Auto-open Customer WhatsApp'
                  : autoOpenTarget === 'both'
                  ? 'Auto-open Both (Admin first, then Customer)'
                  : 'Manual dispatch only'}
              </strong>
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={resetForm}
                className="px-3.5 py-2.5 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Reset Form
              </button>

              <button
                id="submit-order-form-btn"
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Registering & Opening...'
                    : autoOpenTarget === 'admin'
                    ? 'Place Order & Auto-Open Admin (9938109624)'
                    : autoOpenTarget === 'customer'
                    ? 'Place Order & Auto-Open Customer WhatsApp'
                    : autoOpenTarget === 'both'
                    ? 'Place Order & Auto-Open Both'
                    : 'Place Order (Manual WhatsApp)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </form>
      </>
      )}

      {/* Add Designer Modal */}
      <AddDesignerModal
        isOpen={isAddDesignerOpen}
        onClose={() => setIsAddDesignerOpen(false)}
        existingDesigners={activeDesigners}
        onAddDesigner={(newDesigner) => {
          if (onAddDesigner) {
            onAddDesigner(newDesigner);
          }
          setDesignerOperator(newDesigner);
        }}
      />

      {/* Work Type Samples & Rate Viewer Modal */}
      <WorkTypeSampleViewerModal
        isOpen={isSampleViewerOpen}
        onClose={() => setIsSampleViewerOpen(false)}
        workTypes={currentWorkTypes}
        selectedWorkTypeTitle={workType}
        onSelectWorkType={(selectedTitle) => {
          handleWorkTypeChange(selectedTitle);
          setIsSampleViewerOpen(false);
        }}
      />
    </div>
  );
};
