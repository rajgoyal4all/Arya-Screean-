export type WorkType =
  | 'Flex Printing'
  | 'Banner'
  | 'DTP'
  | 'Visiting Card'
  | 'Wedding Card'
  | 'Invitation Card'
  | 'Poster'
  | 'Pamphlet'
  | 'Photo Printing'
  | 'Lamination'
  | 'Xerox'
  | 'Other'
  | (string & {});

export interface WorkSample {
  id: string; // e.g. SMP-001
  title: string; // e.g. "Frontlit Star Flex Shop Hoarding"
  description?: string;
  imageUrl: string; // Data URL or Image URL or SVG preview
  dimensions?: string; // e.g. "12 x 4 ft"
  materialUsed?: string; // e.g. "Star Flex 340 GSM"
  clientName?: string; // e.g. "Shri Radhey Sweets"
  uploadedAt: string; // e.g. "2026-09-24"
  fileSize?: string;
  categoryTag?: string;
}

export interface WorkTypeItem {
  id: string; // e.g. WT-001
  title: string; // e.g. "Flex Printing (Star Frontlit)"
  category: string; // e.g. "Outdoor Signage", "Cards & Wedding", etc.
  description: string;
  unit: string; // e.g. "sq.ft", "per 1000 pcs", "per piece", "per book"
  basePrice: number; // e.g. 12
  minQuantity: number; // e.g. 1
  defaultDimensions: string; // e.g. "10 x 3 ft"
  materialOptions: string[]; // e.g. ["Star Flex 340 GSM", "Korean Flex 280 GSM"]
  estimatedTurnaround: string; // e.g. "Same Day (2-4 hrs)"
  samples: WorkSample[];
  isActive: boolean;
  isPopular?: boolean;
  createdAt: string;
  notes?: string;
}

export type OrderStatus =
  | 'Pending Confirmation'
  | 'Confirmed'
  | 'New'
  | 'Design Pending'
  | 'Designing'
  | 'Customer Approval'
  | 'Printing'
  | 'Finishing'
  | 'Ready'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus = 'Paid' | 'Partial' | 'Pending';

export type PaymentMethod =
  | 'Cash'
  | 'UPI / GPay / PhonePe'
  | 'Debit / Credit Card'
  | 'Bank Transfer'
  | 'Cheque';

export type WhatsAppStatus = 'Sent' | 'Delivered' | 'Read' | 'Failed' | 'Pending';

export interface OrderItem {
  id: string; // Internal unique ID
  orderId: string; // e.g. ARYA-2026-0001
  customerId: string; // e.g. CUST-1001
  dateTime: string; // e.g. 2026-09-21 14:30
  
  // Customer Details
  customerName: string;
  mobileNumber: string;
  whatsappNumber: string;
  address: string;
  villageTown: string;
  district: string;
  pincode: string;
  email: string;

  // Work Details
  workType: WorkType;
  workDescription: string;
  width: string;
  height: string;
  sizeDimensions: string; // e.g. 10x4 ft or A4
  quantity: number;
  material: string;
  designFileName: string;
  designFileUploadOrLink: string;
  deliveryDate: string;
  specialInstructions: string;
  designerOperator: string;

  // Payment Details
  amount: number;
  advancePaid: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;

  // Status & Logs
  orderStatus: OrderStatus;
  adminConfirmed?: boolean;
  confirmedAt?: string;
  confirmedBy?: string;
  whatsappStatus: WhatsAppStatus;
  whatsappResponse?: string;
  smsStatus?: 'Sent' | 'Failed' | 'Pending';
  remarks: string;
}

export interface WhatsAppLogEntry {
  id: string;
  dateTime: string;
  orderId: string;
  customerName: string;
  whatsappNumber: string;
  messageType:
    | 'Order Confirmation'
    | 'Order Confirmed by Admin'
    | 'Status Update'
    | 'Ready for Delivery'
    | 'Payment Reminder';
  messageText: string;
  status: WhatsAppStatus;
  apiResponse: string;
  retryCount: number;
}

export interface ApiSettings {
  phoneNumberId: string;
  accountId: string;
  accessToken: string;
  apiUrl: string;
  templateName: string;
  languageCode: string;
  apiStatus: 'Connected' | 'Test Mode' | 'Disconnected';
  lastMessageStatus: string;
  provider: 'Meta WhatsApp Cloud API' | 'Twilio' | 'Gupshup' | 'Simulator / Direct Web';
  enableAutoSend: boolean;

  // Carrier SMS Gateway Configuration (Fast2SMS / Twilio / Webhook for direct cellular mobile SMS)
  smsGatewayProvider?: 'None' | 'Fast2SMS (India)' | 'Twilio SMS' | 'Custom Webhook';
  smsApiKey?: string;
  smsSenderId?: string;
  smsWebhookUrl?: string;
  smsDirectAutoOpen?: boolean;
}

export interface ShopProfile {
  shopName: string;
  tagline: string;
  address: string;
  villageTown: string;
  district: string;
  pincode: string;
  phone1: string;
  phone2: string;
  email: string;
  gstNumber: string;
  logoUrl: string;
  logoStyle?: string;
  accentColor?: string;
}

export interface Designer {
  id: string; // e.g. DES-001
  name: string; // e.g. Ramesh Sharma
  role: string; // e.g. Flex Master & Large Format
  phone: string; // e.g. +91 98370 11221
  email: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  skills: string[]; // e.g. ['CorelDRAW', 'FlexiSign']
  joinedDate: string;
  dailyCapacity?: number;
  notes?: string;
}

export type UserRole = 'admin' | 'customer';

export interface AuthUser {
  role: UserRole;
  mobileNumber: string;
  name: string;
  customerId?: string;
  loginTime?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'new_customer'
  | 'new_order'
  | 'calendar'
  | 'search'
  | 'work_orders'
  | 'work_types'
  | 'customer_orders'
  | 'customer_db'
  | 'designer_db'
  | 'payments'
  | 'whatsapp_log'
  | 'settings';
