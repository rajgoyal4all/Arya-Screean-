import { OrderItem, WhatsAppLogEntry, ApiSettings, ShopProfile, Designer, WorkTypeItem, WorkSample, AuthUser } from '../types';
import { DEFAULT_WORK_TYPES } from './defaultWorkTypes';

const STORAGE_KEY_ORDERS = 'arya_screen_orders_v2';
const STORAGE_KEY_LOGS = 'arya_screen_whatsapp_logs_v2';
const STORAGE_KEY_SETTINGS = 'arya_screen_api_settings_v1';
const STORAGE_KEY_PROFILE = 'arya_screen_shop_profile_v1';
const STORAGE_KEY_DESIGNERS = 'arya_screen_designers_v1';
const STORAGE_KEY_WORK_TYPES = 'arya_screen_work_types_v1';
const STORAGE_KEY_AUTH = 'arya_screen_auth_user_v1';

export const ADMIN_MOBILE = '9938109624';

export const DEFAULT_ADMIN_USER: AuthUser = {
  role: 'admin',
  mobileNumber: '9938109624',
  name: 'Pramod Sagria (Admin)',
};

export function getStoredAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.role || !parsed.mobileNumber) {
      return null;
    }
    if (parsed.role === 'admin') {
      if (
        parsed.mobileNumber !== '9938109624' ||
        !parsed.name ||
        parsed.name.includes('Pramond')
      ) {
        parsed.mobileNumber = '9938109624';
        parsed.name = 'Pramod Sagria (Admin)';
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(parsed));
      }
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

export function clearStoredAuthUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_AUTH);
  } catch (e) {
    console.error('Failed to clear auth user', e);
  }
}

export function saveStoredAuthUser(user: AuthUser | null): void {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    } else {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    }
  } catch (e) {
    console.error('Failed to save auth user', e);
  }
}

// Cleanup previous v1 demo cache if present so database is cleared as requested
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('arya_screen_orders_v1');
    localStorage.removeItem('arya_screen_whatsapp_logs_v1');
  }
} catch (e) {}

export const DEFAULT_SHOP_PROFILE: ShopProfile = {
  shopName: 'arya2',
  tagline: 'Flex, All Print works, Polymer Stamp, All online works',
  address: 'Shop No. 4-5, Main Market Road, Opp. Bus Stand',
  villageTown: 'Chhata',
  district: 'Mathura',
  pincode: '281401',
  phone1: '9938109624',
  phone2: '9938109624',
  email: 'arya2.print@gmail.com',
  gstNumber: '09AAWPA1234B1Z2',
  logoUrl: '/arya2_logo.jpg',
  logoStyle: 'arya2_3d',
  accentColor: 'amber',
};

export const DEFAULT_API_SETTINGS: ApiSettings = {
  phoneNumberId: '109847291839210',
  accountId: '192847109283741',
  accessToken: 'EAAGm0PX4ZCpsBAK... (Replace with Meta Graph Token)',
  apiUrl: 'https://graph.facebook.com/v21.0',
  templateName: 'arya_screen_order_confirmation',
  languageCode: 'en_US',
  apiStatus: 'Connected',
  lastMessageStatus: 'Ready to send messages via WhatsApp Business Cloud API',
  provider: 'Meta WhatsApp Cloud API',
  enableAutoSend: true,
  smsGatewayProvider: 'None',
  smsApiKey: '',
  smsSenderId: '',
  smsWebhookUrl: '',
  smsDirectAutoOpen: true,
};

export const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ord_1',
    orderId: 'ARYA-2026-0001',
    customerId: 'CUST-1001',
    dateTime: '2026-09-20 10:15',
    customerName: 'Shri Radhey Sweets (Mr. Manoj Sharma)',
    mobileNumber: '9837123450',
    whatsappNumber: '9837123450',
    address: 'Near Gandhi Chowk, Station Road',
    villageTown: 'Chhata',
    district: 'Mathura',
    pincode: '281401',
    email: 'radhey.sweets@gmail.com',
    workType: 'Flex Printing',
    workDescription: 'Front Elevation Star Flex Glow Sign Board with Metal Framing',
    width: '12',
    height: '4',
    sizeDimensions: '12x4 ft',
    quantity: 1,
    material: 'Star Backlit Flex 340 GSM',
    designFileName: 'Radhey_Shop_Board_Final.cdr',
    designFileUploadOrLink: 'https://drive.google.com/arya/radhey-flex.pdf',
    deliveryDate: '2026-09-22',
    specialInstructions: 'Bright colors, eyelets on all 4 corners, 1-inch border margin for frame fitting.',
    designerOperator: 'Ramesh Sharma (Flex Master)',
    amount: 2400,
    advancePaid: 1000,
    balanceAmount: 1400,
    paymentStatus: 'Partial',
    paymentMethod: 'UPI / GPay / PhonePe',
    orderStatus: 'Printing',
    whatsappStatus: 'Delivered',
    whatsappResponse: '200 OK - Message ID: wamid.HBgMOTE5ODM3MTIzNDUwFQIAERgSRTI0',
    remarks: 'Customer requested evening delivery after 5 PM.',
  },
  {
    id: 'ord_2',
    orderId: 'ARYA-2026-0002',
    customerId: 'CUST-1002',
    dateTime: '2026-09-20 11:30',
    customerName: 'Advocate V. K. Gupta',
    mobileNumber: '9412098760',
    whatsappNumber: '9412098760',
    address: 'Chamber No. 14, Civil Court',
    villageTown: 'Kosi Kalan',
    district: 'Mathura',
    pincode: '281403',
    email: 'vkgupta.law@yahoo.com',
    workType: 'Visiting Card',
    workDescription: 'Premium Velvet Matte Visiting Cards with Golden Foil Embossing',
    width: '3.5',
    height: '2',
    sizeDimensions: '3.5x2 in',
    quantity: 1000,
    material: '350 GSM Art Card with Velvet Lamination',
    designFileName: 'VK_Gupta_Advocate_Card.ai',
    designFileUploadOrLink: 'https://drive.google.com/arya/vk-card.ai',
    deliveryDate: '2026-09-23',
    specialInstructions: 'Golden foil on High Court emblem & advocate name. Double side print.',
    designerOperator: 'Sunil Verma (DTP & Graphics)',
    amount: 1200,
    advancePaid: 1200,
    balanceAmount: 0,
    paymentStatus: 'Paid',
    paymentMethod: 'Cash',
    orderStatus: 'Finishing',
    whatsappStatus: 'Read',
    whatsappResponse: '200 OK - Message ID: wamid.HBgMOTE5NDEyMDk4NzYwFQIAERgSRTI4',
    remarks: 'Full payment received in cash.',
  },
  {
    id: 'ord_3',
    orderId: 'ARYA-2026-0003',
    customerId: 'CUST-1003',
    dateTime: '2026-09-21 09:45',
    customerName: 'Pandit Devendra Shastri',
    mobileNumber: '9897811223',
    whatsappNumber: '9897811223',
    address: 'Shri Krishna Nagar, Temple Road',
    villageTown: 'Barsana',
    district: 'Mathura',
    pincode: '281405',
    email: 'devendra.shastri@gmail.com',
    workType: 'Wedding Card',
    workDescription: 'Traditional Royal Box Wedding Invitation Cards with Radha Krishna Motifs',
    width: '8',
    height: '10',
    sizeDimensions: '8x10 in',
    quantity: 350,
    material: 'Metallic Gold Handmade Board with Silk Tassel',
    designFileName: 'Devendra_Wedding_Card_Matter.docx',
    designFileUploadOrLink: 'https://drive.google.com/arya/wedding-shastri.pdf',
    deliveryDate: '2026-09-25',
    specialInstructions: 'Red ink screen printing on inserts. Special proof checking required before final print.',
    designerOperator: 'Sunil Verma (DTP & Graphics)',
    amount: 14000,
    advancePaid: 5000,
    balanceAmount: 9000,
    paymentStatus: 'Partial',
    paymentMethod: 'UPI / GPay / PhonePe',
    orderStatus: 'Customer Approval',
    whatsappStatus: 'Sent',
    whatsappResponse: '200 OK - Message ID: wamid.HBgMOTE5ODk3ODExMjIzFQIAERgSRTMx',
    remarks: 'Proof sent on WhatsApp, waiting for final green light.',
  },
  {
    id: 'ord_4',
    orderId: 'ARYA-2026-0004',
    customerId: 'CUST-1004',
    dateTime: '2026-09-21 11:10',
    customerName: 'Apex Coaching Institute (Director Amit Jha)',
    mobileNumber: '9837994411',
    whatsappNumber: '9837994411',
    address: '2nd Floor, Sai Plaza, GT Road',
    villageTown: 'Chhata',
    district: 'Mathura',
    pincode: '281401',
    email: 'apexcoaching.chhata@gmail.com',
    workType: 'Pamphlet',
    workDescription: 'Admission Open 2026-27 Double Sided Multicolor Flyers',
    width: '8.27',
    height: '11.69',
    sizeDimensions: 'A4 (8.27x11.69 in)',
    quantity: 5000,
    material: '90 GSM Gloss Art Paper',
    designFileName: 'Apex_Pamphlet_A4_Sep2026.cdr',
    designFileUploadOrLink: 'https://drive.google.com/arya/apex-flyer.cdr',
    deliveryDate: '2026-09-22',
    specialInstructions: 'Bundle in 500 pcs each for easy newspaper insertion.',
    designerOperator: 'Ramesh Sharma (Flex Master)',
    amount: 4500,
    advancePaid: 2000,
    balanceAmount: 2500,
    paymentStatus: 'Partial',
    paymentMethod: 'Cash',
    orderStatus: 'Ready',
    whatsappStatus: 'Delivered',
    whatsappResponse: '200 OK - Message ID: wamid.HBgMOTE5ODM3OTk0NDExFQIAERgSRTM0',
    remarks: 'Job completed. Sent ready notification for pickup.',
  },
  {
    id: 'ord_5',
    orderId: 'ARYA-2026-0005',
    customerId: 'CUST-1005',
    dateTime: '2026-09-21 12:40',
    customerName: 'Kisan Krishi Sewa Kendra',
    mobileNumber: '9760124578',
    whatsappNumber: '9760124578',
    address: 'Anaj Mandi Gate No. 2',
    villageTown: 'Nandgaon',
    district: 'Mathura',
    pincode: '281402',
    email: 'kisankrishi@gmail.com',
    workType: 'Banner',
    workDescription: 'Seasonal Wheat Seeds & Organic Fertilizer Promo Banners',
    width: '6',
    height: '3',
    sizeDimensions: '6x3 ft',
    quantity: 4,
    material: 'Normal Flex 260 GSM',
    designFileName: 'Kisan_Krishi_Banners_4pcs.pdf',
    designFileUploadOrLink: '',
    deliveryDate: '2026-09-21',
    specialInstructions: 'Urgent delivery needed by 6 PM today.',
    designerOperator: 'Ramesh Sharma (Flex Master)',
    amount: 1080,
    advancePaid: 1080,
    balanceAmount: 0,
    paymentStatus: 'Paid',
    paymentMethod: 'UPI / GPay / PhonePe',
    orderStatus: 'Delivered',
    whatsappStatus: 'Read',
    whatsappResponse: '200 OK - Message ID: wamid.HBgMOTE5NzYwMTI0NTc4FQIAERgSRTM5',
    remarks: 'Delivered to Mr. Harish Kumar at 4:30 PM.',
  },
  {
    id: 'ord_6',
    orderId: 'ARYA-2026-0006',
    customerId: 'CUST-1006',
    dateTime: '2026-09-21 14:00',
    customerName: 'Balaji Marble & Granites',
    mobileNumber: '9927113355',
    whatsappNumber: '9927113355',
    address: 'Highway Bypass, Near Toll Plaza',
    villageTown: 'Kosi Kalan',
    district: 'Mathura',
    pincode: '281403',
    email: 'balajimarbles26@gmail.com',
    workType: 'DTP',
    workDescription: 'GST Bill Book 3-Ply with Serial Numbering & Perforation',
    width: '8.5',
    height: '11',
    sizeDimensions: '1/4 Demy Size',
    quantity: 10,
    material: 'Maplitho 70 GSM + Carbon Paper Duplicate',
    designFileName: 'Balaji_BillBook_Format.xlsx',
    designFileUploadOrLink: '',
    deliveryDate: '2026-09-24',
    specialInstructions: 'Hard binding with serial number starting from 0001.',
    designerOperator: 'Sunil Verma (DTP & Graphics)',
    amount: 2200,
    advancePaid: 500,
    balanceAmount: 1700,
    paymentStatus: 'Partial',
    paymentMethod: 'Cash',
    orderStatus: 'Designing',
    whatsappStatus: 'Sent',
    whatsappResponse: '200 OK - Message ID: wamid.HBgMOTE5OTI3MTEzMzU1FQIAERgSRTQy',
    remarks: 'Layout under preparation.',
  }
];

export const INITIAL_WHATSAPP_LOGS: WhatsAppLogEntry[] = [
  {
    id: 'log_1',
    dateTime: '2026-09-20 10:16',
    orderId: 'ARYA-2026-0001',
    customerName: 'Shri Radhey Sweets',
    whatsappNumber: '9837123450',
    messageType: 'Order Confirmation',
    messageText: `Thank you for visiting ARYA SCREEN! ❤️\n\nDear Shri Radhey Sweets (Mr. Manoj Sharma),\n\nThank you for choosing Arya Screen.\n\nYour order has been successfully registered.\n\nOrder ID: ARYA-2026-0001\nWork: Flex Printing\nAmount: ₹2400\nDelivery Date: 2026-09-22\n\nWe appreciate your support and look forward to serving you again.\n\n— ARYA SCREEN`,
    status: 'Delivered',
    apiResponse: 'HTTP 200 OK: {"messaging_product":"whatsapp","contacts":[{"input":"9837123450","wa_id":"919837123450"}],"messages":[{"id":"wamid.HBgMOTE5ODM3MTIzNDUwFQIAERgSRTI0"}]}',
    retryCount: 0,
  },
  {
    id: 'log_2',
    dateTime: '2026-09-20 11:31',
    orderId: 'ARYA-2026-0002',
    customerName: 'Advocate V. K. Gupta',
    whatsappNumber: '9412098760',
    messageType: 'Order Confirmation',
    messageText: `Thank you for visiting ARYA SCREEN! ❤️\n\nDear Advocate V. K. Gupta,\n\nThank you for choosing Arya Screen.\n\nYour order has been successfully registered.\n\nOrder ID: ARYA-2026-0002\nWork: Visiting Card\nAmount: ₹1200\nDelivery Date: 2026-09-23\n\nWe appreciate your support and look forward to serving you again.\n\n— ARYA SCREEN`,
    status: 'Read',
    apiResponse: 'HTTP 200 OK: {"messaging_product":"whatsapp","contacts":[{"input":"9412098760","wa_id":"919412098760"}],"messages":[{"id":"wamid.HBgMOTE5NDEyMDk4NzYwFQIAERgSRTI4"}]}',
    retryCount: 0,
  },
  {
    id: 'log_3',
    dateTime: '2026-09-21 09:46',
    orderId: 'ARYA-2026-0003',
    customerName: 'Pandit Devendra Shastri',
    whatsappNumber: '9897811223',
    messageType: 'Order Confirmation',
    messageText: `Thank you for visiting ARYA SCREEN! ❤️\n\nDear Pandit Devendra Shastri,\n\nThank you for choosing Arya Screen.\n\nYour order has been successfully registered.\n\nOrder ID: ARYA-2026-0003\nWork: Wedding Card\nAmount: ₹14000\nDelivery Date: 2026-09-25\n\nWe appreciate your support and look forward to serving you again.\n\n— ARYA SCREEN`,
    status: 'Sent',
    apiResponse: 'HTTP 200 OK: {"messaging_product":"whatsapp","contacts":[{"input":"9897811223","wa_id":"919897811223"}],"messages":[{"id":"wamid.HBgMOTE5ODk3ODExMjIzFQIAERgSRTMx"}]}',
    retryCount: 0,
  },
  {
    id: 'log_4',
    dateTime: '2026-09-21 11:11',
    orderId: 'ARYA-2026-0004',
    customerName: 'Apex Coaching Institute',
    whatsappNumber: '9837994411',
    messageType: 'Order Confirmation',
    messageText: `Thank you for visiting ARYA SCREEN! ❤️\n\nDear Apex Coaching Institute (Director Amit Jha),\n\nThank you for choosing Arya Screen.\n\nYour order has been successfully registered.\n\nOrder ID: ARYA-2026-0004\nWork: Pamphlet\nAmount: ₹4500\nDelivery Date: 2026-09-22\n\nWe appreciate your support and look forward to serving you again.\n\n— ARYA SCREEN`,
    status: 'Delivered',
    apiResponse: 'HTTP 200 OK: {"messaging_product":"whatsapp","contacts":[{"input":"9837994411","wa_id":"919837994411"}],"messages":[{"id":"wamid.HBgMOTE5ODM3OTk0NDExFQIAERgSRTM0"}]}',
    retryCount: 0,
  },
  {
    id: 'log_5',
    dateTime: '2026-09-21 12:41',
    orderId: 'ARYA-2026-0005',
    customerName: 'Kisan Krishi Sewa Kendra',
    whatsappNumber: '9760124578',
    messageType: 'Order Confirmation',
    messageText: `Thank you for visiting ARYA SCREEN! ❤️\n\nDear Kisan Krishi Sewa Kendra,\n\nThank you for choosing Arya Screen.\n\nYour order has been successfully registered.\n\nOrder ID: ARYA-2026-0005\nWork: Banner\nAmount: ₹1080\nDelivery Date: 2026-09-21\n\nWe appreciate your support and look forward to serving you again.\n\n— ARYA SCREEN`,
    status: 'Read',
    apiResponse: 'HTTP 200 OK: {"messaging_product":"whatsapp","contacts":[{"input":"9760124578","wa_id":"919760124578"}],"messages":[{"id":"wamid.HBgMOTE5NzYwMTI0NTc4FQIAERgSRTM5"}]}',
    retryCount: 0,
  }
];

export function getStoredOrders(): OrderItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load orders from localStorage', e);
    return [];
  }
}

export function saveStoredOrders(orders: OrderItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders to localStorage', e);
  }
}

export function getStoredWhatsAppLogs(): WhatsAppLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load logs', e);
    return [];
  }
}

export function saveStoredWhatsAppLogs(logs: WhatsAppLogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save logs', e);
  }
}

/**
 * Completely clears the orders database and WhatsApp logs from localStorage
 */
export function clearAllStoredData(): void {
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to clear database', e);
  }
}

/**
 * Restores sample orders & logs for testing if needed
 */
export function restoreSampleData(): { orders: OrderItem[]; logs: WhatsAppLogEntry[] } {
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(INITIAL_WHATSAPP_LOGS));
  } catch (e) {
    console.error('Failed to restore sample data', e);
  }
  return { orders: INITIAL_ORDERS, logs: INITIAL_WHATSAPP_LOGS };
}

export function getStoredApiSettings(): ApiSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_API_SETTINGS));
      return DEFAULT_API_SETTINGS;
    }
    return { ...DEFAULT_API_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_API_SETTINGS;
  }
}

export function saveStoredApiSettings(settings: ApiSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function getStoredShopProfile(): ShopProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(DEFAULT_SHOP_PROFILE));
      return DEFAULT_SHOP_PROFILE;
    }
    const parsed = JSON.parse(raw);
    // If the saved profile has legacy Arya Screen default or outdated phone/tagline, upgrade
    if (!parsed.logoUrl || parsed.logoUrl === '' || parsed.logoUrl.trim() === '') {
      parsed.logoUrl = '/arya2_logo.jpg';
    }
    if (!parsed.shopName || parsed.shopName === 'ARYA SCREEN' || parsed.shopName === 'Arya 2') {
      parsed.shopName = 'arya2';
    }
    if (!parsed.tagline || parsed.tagline.includes('Print Ideas')) {
      parsed.tagline = 'Flex, All Print works, Polymer Stamp, All online works';
    }
    if (!parsed.phone1 || parsed.phone1.includes('98370 12345') || parsed.phone1.includes('993810964') || parsed.phone1 === '993810964') {
      parsed.phone1 = '9938109624';
    }
    return { ...DEFAULT_SHOP_PROFILE, ...parsed };
  } catch (e) {
    return DEFAULT_SHOP_PROFILE;
  }
}

export function saveStoredShopProfile(profile: ShopProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

const STORAGE_KEY_DESIGNER_PROFILES = 'arya_screen_designers_v2';

export const DEFAULT_DESIGNER_PROFILES: Designer[] = [
  {
    id: 'DES-000',
    name: 'Pramod Sagria',
    role: 'Owner & Production Head',
    phone: '9938109624',
    email: 'pramod.sagria@arya2.com',
    status: 'Active',
    skills: ['Flex', 'All Print works', 'Polymer Stamp', 'All online works'],
    joinedDate: '2022-01-01',
    dailyCapacity: 25,
    notes: 'arya2 Lead Executive (Pramod Sagria). Mobile: 9938109624. Specializes in Flex, All Print works, Polymer Stamp, All online works.',
  },
  {
    id: 'DES-001',
    name: 'Ramesh Sharma',
    role: 'Flex Master & Large Format',
    phone: '+91 98370 11221',
    email: 'ramesh.sharma@arya2.com',
    status: 'Active',
    skills: ['CorelDRAW', 'FlexiSign', 'Large Format Flex', 'Star Backlit', 'Vinyl Plotter'],
    joinedDate: '2023-04-10',
    dailyCapacity: 10,
    notes: 'Senior specialist for large roadside hoardings, banners, frontlit/backlit boards, and flex framing.',
  },
  {
    id: 'DES-002',
    name: 'Sunil Verma',
    role: 'DTP & Graphics Specialist',
    phone: '+91 98370 22332',
    email: 'sunil.verma@arya2.com',
    status: 'Active',
    skills: ['Photoshop', 'Illustrator', 'Hindi & English Typography', 'Visiting Cards', 'Pamphlets'],
    joinedDate: '2023-08-15',
    dailyCapacity: 8,
    notes: 'Lead graphic artist handling corporate identities, brochures, multi-color offset layouts, and Hindi DTP.',
  },
  {
    id: 'DES-003',
    name: 'Priya Rajput',
    role: 'Wedding Cards & Design Specialist',
    phone: '+91 98370 33443',
    email: 'priya.rajput@arya2.com',
    status: 'Active',
    skills: ['InDesign', 'CorelDRAW', 'Wedding & Invitation Cards', 'Die-cut Packaging', 'Gold Foil Emboss'],
    joinedDate: '2024-01-08',
    dailyCapacity: 6,
    notes: 'Luxury designer for wedding cards, invitation boxes, golden hot foil stamping, and invitation videos.',
  },
  {
    id: 'DES-004',
    name: 'Mohit Saini',
    role: 'Finishing & Machine Operator',
    phone: '+91 98370 44554',
    email: 'mohit.saini@arya2.com',
    status: 'Active',
    skills: ['Cold & Thermal Lamination', 'Eyelet Punching', 'Framing', 'Polymer Stamp Machine', 'Digital Xerox'],
    joinedDate: '2024-05-20',
    dailyCapacity: 12,
    notes: 'Technical post-press machine operator. Specializes in polymer stamps, thermal matte/gloss lamination.',
  },
  {
    id: 'DES-005',
    name: 'Direct Counter Operator',
    role: 'Walk-in & Quick Order Desk',
    phone: '+91 98370 55665',
    email: 'counter@arya2.com',
    status: 'Active',
    skills: ['Instant Xerox', 'Document Scanning', 'Urgent Photo Prints', 'Lamination', 'Customer Billing'],
    joinedDate: '2024-02-01',
    dailyCapacity: 20,
    notes: 'Front counter operator handling instant walk-in xerox, printouts, passport photos, and counter billing.',
  },
];

export const DEFAULT_DESIGNERS = DEFAULT_DESIGNER_PROFILES.map(
  (d) => `${d.name} (${d.role})`
);

export function getStoredDesignerProfiles(): Designer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DESIGNER_PROFILES);
    if (!raw) {
      localStorage.setItem(
        STORAGE_KEY_DESIGNER_PROFILES,
        JSON.stringify(DEFAULT_DESIGNER_PROFILES)
      );
      return DEFAULT_DESIGNER_PROFILES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      let changed = false;
      const updated = parsed.map((d: Designer) => {
        if (d.name && d.name.includes('Pramond')) {
          changed = true;
          return {
            ...d,
            name: d.name.replace(/Pramond/g, 'Pramod'),
            phone: '9938109624',
            email: d.email?.replace(/pramond/g, 'pramod') || 'pramod.sagria@arya2.com',
            notes: d.notes?.replace(/Pramond/g, 'Pramod') || d.notes,
          };
        }
        return d;
      });
      if (changed) {
        localStorage.setItem(
          STORAGE_KEY_DESIGNER_PROFILES,
          JSON.stringify(updated)
        );
      }
      return updated;
    }
    return DEFAULT_DESIGNER_PROFILES;
  } catch (e) {
    return DEFAULT_DESIGNER_PROFILES;
  }
}

export function saveStoredDesignerProfiles(profiles: Designer[]): void {
  try {
    localStorage.setItem(
      STORAGE_KEY_DESIGNER_PROFILES,
      JSON.stringify(profiles)
    );
    // Sync with legacy string array as well
    const stringLabels = profiles.map((p) => `${p.name} (${p.role})`);
    localStorage.setItem(STORAGE_KEY_DESIGNERS, JSON.stringify(stringLabels));
  } catch (e) {
    console.error('Failed to save designer profiles', e);
  }
}

export function addStoredDesignerProfile(
  designerData: Omit<Designer, 'id'>
): Designer[] {
  const current = getStoredDesignerProfiles();
  const nextNum = current.length + 1;
  const newId = `DES-${String(nextNum).padStart(3, '0')}`;
  const newProfile: Designer = {
    ...designerData,
    id: newId,
  };
  const updated = [...current, newProfile];
  saveStoredDesignerProfiles(updated);
  return updated;
}

export function updateStoredDesignerProfile(
  updatedProfile: Designer
): Designer[] {
  const current = getStoredDesignerProfiles();
  const updated = current.map((d) =>
    d.id === updatedProfile.id ? updatedProfile : d
  );
  saveStoredDesignerProfiles(updated);
  return updated;
}

export function removeStoredDesignerProfile(id: string): Designer[] {
  const current = getStoredDesignerProfiles();
  const updated = current.filter((d) => d.id !== id);
  const final = updated.length > 0 ? updated : DEFAULT_DESIGNER_PROFILES;
  saveStoredDesignerProfiles(final);
  return final;
}

export function getStoredDesigners(): string[] {
  const profiles = getStoredDesignerProfiles();
  if (profiles && profiles.length > 0) {
    return profiles.map((p) => `${p.name} (${p.role})`);
  }
  return DEFAULT_DESIGNERS;
}

export function saveStoredDesigners(designers: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DESIGNERS, JSON.stringify(designers));
  } catch (e) {
    console.error('Failed to save designers', e);
  }
}

export function addStoredDesigner(newDesigner: string): string[] {
  const trimmed = newDesigner.trim();
  if (!trimmed) return getStoredDesigners();
  const profiles = getStoredDesignerProfiles();
  
  // Extract name and role if written as "Name (Role)"
  let name = trimmed;
  let role = 'Designer & Operator';
  const match = trimmed.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    name = match[1].trim();
    role = match[2].trim();
  }

  const alreadyExists = profiles.some(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
  if (!alreadyExists) {
    addStoredDesignerProfile({
      name,
      role,
      phone: '+91 98370 00000',
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@arya2.com`,
      status: 'Active',
      skills: ['CorelDRAW', 'Photoshop', 'Printing'],
      joinedDate: new Date().toISOString().split('T')[0],
      dailyCapacity: 8,
      notes: 'Added from quick assignment menu',
    });
  }
  return getStoredDesigners();
}

export function removeStoredDesigner(designerToRemove: string): string[] {
  const profiles = getStoredDesignerProfiles();
  const toRemove = profiles.find(
    (p) =>
      `${p.name} (${p.role})` === designerToRemove ||
      p.name === designerToRemove
  );
  if (toRemove) {
    removeStoredDesignerProfile(toRemove.id);
  }
  return getStoredDesigners();
}

// Generate the next unique Order ID strictly formatted as ARYA-2026-0001
export function generateNextOrderId(orders: OrderItem[]): string {
  const currentYear = new Date().getFullYear();
  const prefix = `ARYA-${currentYear}-`;
  
  let maxNum = 0;
  for (const ord of orders) {
    if (ord.orderId && ord.orderId.startsWith(prefix)) {
      const numPart = parseInt(ord.orderId.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }
  
  const nextNum = maxNum + 1;
  const padded = String(nextNum).padStart(4, '0');
  return `${prefix}${padded}`;
}

// Generate next Customer ID strictly formatted as CUST-1001
export function generateNextCustomerId(orders: OrderItem[]): string {
  let maxNum = 1000;
  for (const ord of orders) {
    if (ord.customerId && ord.customerId.startsWith('CUST-')) {
      const numPart = parseInt(ord.customerId.replace('CUST-', ''), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }
  return `CUST-${maxNum + 1}`;
}

// -------------------------------------------------------------
// Work Types & Samples Storage Management
// -------------------------------------------------------------

export function getStoredWorkTypes(): WorkTypeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WORK_TYPES);
    if (!raw) {
      localStorage.setItem(
        STORAGE_KEY_WORK_TYPES,
        JSON.stringify(DEFAULT_WORK_TYPES)
      );
      return DEFAULT_WORK_TYPES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_WORK_TYPES;
  } catch (e) {
    return DEFAULT_WORK_TYPES;
  }
}

export function saveStoredWorkTypes(workTypes: WorkTypeItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_WORK_TYPES, JSON.stringify(workTypes));
  } catch (e) {
    console.error('Failed to save work types', e);
  }
}

export function addStoredWorkType(
  item: Omit<WorkTypeItem, 'id' | 'createdAt'>
): WorkTypeItem[] {
  const current = getStoredWorkTypes();
  const nextNum = current.length + 1;
  const newId = `WT-${String(nextNum).padStart(3, '0')}`;
  const newItem: WorkTypeItem = {
    ...item,
    id: newId,
    createdAt: new Date().toISOString().split('T')[0],
  };
  const updated = [newItem, ...current];
  saveStoredWorkTypes(updated);
  return updated;
}

export function updateStoredWorkType(item: WorkTypeItem): WorkTypeItem[] {
  const current = getStoredWorkTypes();
  const updated = current.map((wt) => (wt.id === item.id ? item : wt));
  saveStoredWorkTypes(updated);
  return updated;
}

export function deleteStoredWorkType(id: string): WorkTypeItem[] {
  const current = getStoredWorkTypes();
  const updated = current.filter((wt) => wt.id !== id);
  const final = updated.length > 0 ? updated : DEFAULT_WORK_TYPES;
  saveStoredWorkTypes(final);
  return final;
}

export function addSampleToWorkType(
  workTypeId: string,
  sample: Omit<WorkSample, 'id' | 'uploadedAt'>
): WorkTypeItem[] {
  const current = getStoredWorkTypes();
  const sampleNum = Date.now().toString().slice(-4);
  const newSample: WorkSample = {
    ...sample,
    id: `SMP-${sampleNum}`,
    uploadedAt: new Date().toISOString().split('T')[0],
  };

  const updated = current.map((wt) => {
    if (wt.id === workTypeId) {
      return {
        ...wt,
        samples: [newSample, ...(wt.samples || [])],
      };
    }
    return wt;
  });

  saveStoredWorkTypes(updated);
  return updated;
}

export function deleteSampleFromWorkType(
  workTypeId: string,
  sampleId: string
): WorkTypeItem[] {
  const current = getStoredWorkTypes();
  const updated = current.map((wt) => {
    if (wt.id === workTypeId) {
      return {
        ...wt,
        samples: (wt.samples || []).filter((s) => s.id !== sampleId),
      };
    }
    return wt;
  });

  saveStoredWorkTypes(updated);
  return updated;
}
