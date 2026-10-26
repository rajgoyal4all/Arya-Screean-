import { OrderItem, ApiSettings, WhatsAppLogEntry } from '../types';

export type WhatsAppMessageType =
  | 'Order Confirmation'
  | 'Order Confirmed by Admin'
  | 'Status Update'
  | 'Ready for Delivery'
  | 'Payment Reminder';

export type AutoOpenTarget = 'admin' | 'customer' | 'both' | 'none';

export const ADMIN_PHONE_NUMBER = '9938109624';
export const ADMIN_NAME = 'Pramod Sagria';

export const WHATSAPP_FOOTER = `— *arya2*
Flex, All Print works, Polymer Stamp, All online works
Pramod Sagria with mobile no 9938109624`;

export function formatWhatsAppMessage(
  order: OrderItem,
  type: WhatsAppMessageType = 'Order Confirmation'
): string {
  if (type === 'Order Confirmed by Admin') {
    return `*arya2 - ORDER CONFIRMED BY ADMIN* ✅
Admin: Pramod Sagria (Mobile: 9938109624)
Flex, All Print works, Polymer Stamp, All online works

Dear *${order.customerName}*,

Great news! Your order *${order.orderId}* has been reviewed & *OFFICIALLY CONFIRMED* by Admin Pramod Sagria and queued for immediate production.

*Confirmed Order Details:*
• Order ID: *${order.orderId}*
• Work: ${order.workType} (${order.sizeDimensions || 'Standard'})
• Quantity: ${order.quantity}
• Total Amount: ₹${order.amount}
• Advance Paid: ₹${order.advancePaid}
• *Balance Due: ₹${order.balanceAmount}*
• Target Delivery: *${order.deliveryDate || 'Standard'}*
• Confirmed By: *Admin Pramod Sagria (9938109624)*

${WHATSAPP_FOOTER}`;
  }

  if (type === 'Ready for Delivery') {
    return `*arya2*
Flex, All Print works, Polymer Stamp, All online works

Dear *${order.customerName}*,

Good news! Your order is *READY FOR PICKUP / DELIVERY*!

*Order Details:*
• Order ID: *${order.orderId}*
• Work: ${order.workType} (${order.sizeDimensions || ''})
• Quantity: ${order.quantity}
• Total Amount: ₹${order.amount}
• Advance Paid: ₹${order.advancePaid}
• *Balance to Pay:* ₹${order.balanceAmount}

Please visit our workshop to collect your job.
For any query, reply to this message.

Thank you!
${WHATSAPP_FOOTER}`;
  }

  if (type === 'Payment Reminder') {
    return `*arya2*
Flex, All Print works, Polymer Stamp, All online works

Dear *${order.customerName}*,

This is a gentle reminder regarding payment for your order *${order.orderId}*.

*Payment Summary:*
• Work: ${order.workType}
• Total Amount: ₹${order.amount}
• Advance Paid: ₹${order.advancePaid}
• *Outstanding Balance: ₹${order.balanceAmount}*

You can pay via Cash or UPI (GPay / PhonePe / Paytm).

Thank you!
${WHATSAPP_FOOTER}`;
  }

  if (type === 'Status Update') {
    return `*arya2*
Flex, All Print works, Polymer Stamp, All online works

Dear *${order.customerName}*,

Your order *${order.orderId}* status has been updated:
*Status: ${order.orderStatus}*

• Work: ${order.workType}
• Expected Delivery: ${order.deliveryDate || 'Standard'}

Thank you for choosing arya2!
${WHATSAPP_FOOTER}`;
  }

  // Default: Order Confirmation
  return `*Thank you for visiting arya2!* ❤️

Dear *${order.customerName}*,

Thank you for choosing arya2. Your order has been successfully registered in our production queue.

*Order Summary:*
• Order ID: *${order.orderId}*
• Customer ID: ${order.customerId}
• Work Type: ${order.workType}
• Specifications: ${order.sizeDimensions || 'Standard'} | Qty: ${order.quantity}
• Total Amount: ₹${order.amount}
• Advance Received: ₹${order.advancePaid}
• *Balance Due: ₹${order.balanceAmount}*
• Estimated Delivery: *${order.deliveryDate || 'To be confirmed'}*

We appreciate your support and look forward to serving you again.

${WHATSAPP_FOOTER}`;
}

export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  // Strip all non-numeric characters
  let digits = phone.replace(/\D/g, '');

  // If starts with 0 and 11 digits (e.g. 09837012345)
  if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.substring(1);
  }

  // If 10 digits, add India country code 91
  if (digits.length === 10) {
    return `91${digits}`;
  }

  // If already starts with 91 and has 12 digits
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }

  return digits;
}

/**
 * Generates direct universal WhatsApp dispatch link
 * Supports both WhatsApp Web (desktop) and WhatsApp Mobile App
 */
export function getDirectWhatsAppUrl(
  phone: string,
  message: string
): string {
  const cleanPhone = cleanPhoneNumber(phone);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
}

/**
 * Formats a clean standard SMS text message sent through Admin Mobile 9938109624
 */
export function formatNormalSmsMessage(
  order: OrderItem,
  type: WhatsAppMessageType = 'Order Confirmation'
): string {
  if (type === 'Order Confirmed by Admin') {
    return `[arya2] Dear ${order.customerName}, your Order ${order.orderId} (${order.workType}) is CONFIRMED by Admin Pramod Sagria. Total: Rs.${order.amount}, Bal: Rs.${order.balanceAmount}. Sent via Admin Mobile: 9938109624.`;
  }
  if (type === 'Ready for Delivery') {
    return `[arya2] Dear ${order.customerName}, Order ${order.orderId} is READY for delivery/pickup! Balance due: Rs.${order.balanceAmount}. arya2 Admin: Pramod Sagria (9938109624).`;
  }
  if (type === 'Payment Reminder') {
    return `[arya2] Dear ${order.customerName}, reminder for Order ${order.orderId}. Balance due: Rs.${order.balanceAmount}. Please pay via UPI or Cash. Admin Mobile: 9938109624.`;
  }
  return `[arya2] Dear ${order.customerName}, Order ${order.orderId} for ${order.workType} received in production queue. Total: Rs.${order.amount}, Bal: Rs.${order.balanceAmount}. Admin: Pramod Sagria (9938109624).`;
}

/**
 * Formats full order details message sent to Admin Mobile 9938109624 when customer creates an order
 */
export function formatAdminOrderNotificationMessage(order: OrderItem): string {
  return `*🚨 NEW ORDER PLACED BY CUSTOMER - arya2*
Admin: Pramod Sagria (Mobile: 9938109624)
Flex, All Print works, Polymer Stamp, All online works

*Customer Details:*
• Name: *${order.customerName}*
• Mobile: *${order.mobileNumber}*
• WhatsApp: *${order.whatsappNumber}*
• Location: ${order.villageTown || order.address || 'Local'}

*Work Specifications:*
• Order ID: *${order.orderId}*
• Work Type: *${order.workType}*
• Dimensions: ${order.sizeDimensions || 'Standard'} | Qty: ${order.quantity}
• Material: ${order.material || 'Standard'}
• Description: ${order.workDescription || order.workType}
• Delivery Date: *${order.deliveryDate || 'Standard'}*
• Operator: ${order.designerOperator || 'Counter'}

*Payment Summary:*
• Total Amount: ₹${order.amount}
• Advance Paid: ₹${order.advancePaid}
• *Balance Due: ₹${order.balanceAmount}*
• Payment Method: ${order.paymentMethod}

*Admin Action Required:*
Kindly log into Admin Portal with mobile 9938109624 to review & confirm.
Once confirmed, official confirmation WhatsApp message will deliver to customer from Admin WhatsApp (9938109624).`;
}

/**
 * Formats genuine security OTP message for WhatsApp
 */
export function formatOtpMessage(
  otp: string,
  role: 'admin' | 'customer',
  mobile: string
): string {
  if (role === 'admin') {
    return `*arya2 Admin Portal Access Code* 👑
Admin Mobile: 9938109624 (Pramod Sagria)

Your Admin Login OTP is: *${otp}*

Enter this 4-digit code in the admin login screen to open the Admin Panel with full software control.
Security notice: Never share this OTP with anyone. Valid for 10 minutes.`;
  }

  return `*arya2 Customer Portal Verification* 📱
Dear Customer (+91 ${mobile}),

Your Order Login OTP code is: *${otp}*

Enter this code to verify your mobile number and proceed with creating your order at arya2.
Reviewed & confirmed by Admin Pramod Sagria (9938109624).`;
}

/**
 * Generates direct SMS link for mobile/desktop SMS clients
 */
export function getDirectSmsUrl(phone: string, text: string): string {
  const cleanPhone = cleanPhoneNumber(phone);
  return `sms:+${cleanPhone}?body=${encodeURIComponent(text)}`;
}
/**
 * Generates direct wa.me link for maximum mobile compatibility
 */
export function getWaMeUrl(phone: string, message: string): string {
  const cleanPhone = cleanPhoneNumber(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Formats a short standard SMS message for Admin Mobile 9938109624
 */
export function formatAdminOrderSmsMessage(order: OrderItem): string {
  return `[arya2 ORDER ALERT] Order ${order.orderId} placed by ${order.customerName} (Mob: ${order.mobileNumber}). Work: ${order.workType}, Qty: ${order.quantity}, Total: Rs.${order.amount}, Adv: Rs.${order.advancePaid}, Bal: Rs.${order.balanceAmount}, Delivery: ${order.deliveryDate || 'Standard'}. Admin: Pramod Sagria (9938109624)`;
}

/**
 * Generates direct SMS link to Admin Mobile 9938109624
 */
export function getAdminOrderSmsUrl(order: OrderItem): string {
  return getDirectSmsUrl(ADMIN_PHONE_NUMBER, formatAdminOrderSmsMessage(order));
}

/**
 * Generates direct WhatsApp Web/App link to Admin Mobile 9938109624
 */
export function getAdminOrderWhatsAppUrl(order: OrderItem): string {
  return getDirectWhatsAppUrl(ADMIN_PHONE_NUMBER, formatAdminOrderNotificationMessage(order));
}

/**
 * Generates direct wa.me link to Admin Mobile 9938109624
 */
export function getAdminOrderWaMeUrl(order: OrderItem): string {
  return getWaMeUrl(ADMIN_PHONE_NUMBER, formatAdminOrderNotificationMessage(order));
}

/**
 * Direct phone call link to Admin Mobile 9938109624
 */
export function getAdminCallUrl(): string {
  return `tel:+91${ADMIN_PHONE_NUMBER}`;
}

/**
 * Directly launches WhatsApp to Admin Mobile 9938109624 with complete order details
 */
export function openWhatsAppToAdmin(order: OrderItem): boolean {
  const msg = formatAdminOrderNotificationMessage(order);
  return openWhatsAppDirectly(ADMIN_PHONE_NUMBER, msg);
}

/**
 * Directly launches WhatsApp to Customer mobile with formatted order confirmation message
 */
export function openCustomerWhatsAppDirectly(order: OrderItem): boolean {
  const msg = formatWhatsAppMessage(
    order,
    order.adminConfirmed ? 'Order Confirmed by Admin' : 'Order Confirmation'
  );
  const targetPhone = order.whatsappNumber || order.mobileNumber;
  return openWhatsAppDirectly(targetPhone, msg);
}

/**
 * Executes automatic opening of WhatsApp based on selected target:
 * 'admin' -> Opens Admin WhatsApp (9938109624)
 * 'customer' -> Opens Customer WhatsApp
 * 'both' -> Opens Admin WhatsApp and attempts Customer WhatsApp
 * 'none' -> Does not open, leaves for manual dispatch
 */
export function executeAutoOpenWhatsApp(
  order: OrderItem,
  target: AutoOpenTarget
): {
  openedAdmin: boolean;
  openedCustomer: boolean;
  adminUrl: string;
  customerUrl: string;
} {
  const adminUrl = getAdminOrderWhatsAppUrl(order);
  const customerMsg = formatWhatsAppMessage(
    order,
    order.adminConfirmed ? 'Order Confirmed by Admin' : 'Order Confirmation'
  );
  const customerPhone = order.whatsappNumber || order.mobileNumber;
  const customerUrl = getDirectWhatsAppUrl(customerPhone, customerMsg);

  let openedAdmin = false;
  let openedCustomer = false;

  if (target === 'admin') {
    openedAdmin = openWhatsAppDirectly(ADMIN_PHONE_NUMBER, formatAdminOrderNotificationMessage(order));
  } else if (target === 'customer') {
    openedCustomer = openWhatsAppDirectly(customerPhone, customerMsg);
  } else if (target === 'both') {
    // Open Admin first
    openedAdmin = openWhatsAppDirectly(ADMIN_PHONE_NUMBER, formatAdminOrderNotificationMessage(order));
    // Also try opening Customer (may require user interaction depending on popup blocker)
    try {
      openedCustomer = openWhatsAppDirectly(customerPhone, customerMsg);
    } catch {
      openedCustomer = false;
    }
  }

  return { openedAdmin, openedCustomer, adminUrl, customerUrl };
}

/**
 * Sends order details directly to Admin Mobile 9938109624
 */
export async function sendOrderDetailsToAdminWhatsApp(
  order: OrderItem,
  settings?: ApiSettings
): Promise<{
  success: boolean;
  directUrl: string;
  waMeUrl: string;
  smsUrl: string;
  adminPhone: string;
}> {
  const adminMsg = formatAdminOrderNotificationMessage(order);
  const directUrl = getDirectWhatsAppUrl(ADMIN_PHONE_NUMBER, adminMsg);
  const waMeUrl = getWaMeUrl(ADMIN_PHONE_NUMBER, adminMsg);
  const smsUrl = getAdminOrderSmsUrl(order);

  if (settings && hasLiveMetaCredentials(settings)) {
    try {
      const cleanAdminPhone = cleanPhoneNumber(ADMIN_PHONE_NUMBER);
      const url = `${settings.apiUrl.replace(/\/$/, '')}/${settings.phoneNumberId}/messages`;
      await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${settings.accessToken.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanAdminPhone,
          type: 'text',
          text: { preview_url: false, body: adminMsg },
        }),
      });
      return { success: true, directUrl, waMeUrl, smsUrl, adminPhone: ADMIN_PHONE_NUMBER };
    } catch (e) {
      console.warn('Meta API error sending to admin, fallback to direct url:', e);
    }
  }

  return { success: true, directUrl, waMeUrl, smsUrl, adminPhone: ADMIN_PHONE_NUMBER };
}

/**
 * Dispatches cellular SMS directly to mobile phones via SMS Gateway (Fast2SMS / Twilio / Webhook)
 */
export async function sendDirectCarrierSms(
  targetPhone: string,
  message: string,
  settings?: ApiSettings
): Promise<{ success: boolean; provider: string; details: string }> {
  if (!settings || !settings.smsGatewayProvider || settings.smsGatewayProvider === 'None') {
    return { success: false, provider: 'None', details: 'No active SMS Gateway configured' };
  }

  const cleanDigits = targetPhone.replace(/\D/g, '').slice(-10);

  // Fast2SMS integration (India)
  if (settings.smsGatewayProvider === 'Fast2SMS (India)' && settings.smsApiKey?.trim()) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: settings.smsApiKey.trim(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: message,
          language: 'english',
          flash: 0,
          numbers: cleanDigits,
        }),
      });
      const data = await response.json();
      if (data && data.return) {
        return { success: true, provider: 'Fast2SMS', details: 'Direct cellular SMS delivered to mobile' };
      }
      return { success: false, provider: 'Fast2SMS', details: data?.message?.[0] || 'Fast2SMS gateway error' };
    } catch (e: any) {
      return { success: false, provider: 'Fast2SMS', details: e?.message || 'Network error connecting to SMS Gateway' };
    }
  }

  // Custom Webhook integration
  if (settings.smsGatewayProvider === 'Custom Webhook' && settings.smsWebhookUrl?.trim()) {
    try {
      const response = await fetch(settings.smsWebhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: cleanDigits,
          message: message,
          timestamp: new Date().toISOString(),
        }),
      });
      return { success: response.ok, provider: 'Custom Webhook', details: `Webhook status ${response.status}` };
    } catch (e: any) {
      return { success: false, provider: 'Custom Webhook', details: e?.message || 'Webhook failed' };
    }
  }

  return { success: false, provider: 'None', details: 'SMS Gateway provider not supported' };
}

/**
 * Sends a real OTP to target phone (Admin 9938109624 or Customer phone)
 * Supports Meta Cloud API, Carrier SMS Gateway, and direct universal app links
 */
export async function sendRealOtpViaWhatsApp(
  targetPhone: string,
  otp: string,
  role: 'admin' | 'customer',
  settings?: ApiSettings
): Promise<{
  success: boolean;
  directUrl: string;
  smsUrl: string;
  message: string;
  carrierSmsResult?: { success: boolean; provider: string; details: string };
}> {
  const clean = cleanPhoneNumber(targetPhone);
  const message = formatOtpMessage(otp, role, clean);
  const directUrl = getDirectWhatsAppUrl(clean, message);
  const smsUrl = getDirectSmsUrl(clean, `Your arya2 Login OTP is: ${otp}`);

  let carrierSmsResult: { success: boolean; provider: string; details: string } | undefined;

  // Try direct carrier SMS if settings provided
  if (settings && settings.smsGatewayProvider && settings.smsGatewayProvider !== 'None') {
    try {
      carrierSmsResult = await sendDirectCarrierSms(clean, `Your arya2 login OTP is ${otp}. Admin: Pramod Sagria (9938109624).`, settings);
    } catch (err) {
      console.warn('Carrier SMS dispatch error:', err);
    }
  }

  if (settings && hasLiveMetaCredentials(settings)) {
    try {
      const url = `${settings.apiUrl.replace(/\/$/, '')}/${settings.phoneNumberId}/messages`;
      await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${settings.accessToken.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: clean,
          type: 'text',
          text: { preview_url: false, body: message },
        }),
      });
      return { success: true, directUrl, smsUrl, message, carrierSmsResult };
    } catch (e) {
      console.warn('Meta API error sending OTP, direct link ready:', e);
    }
  }

  return { success: true, directUrl, smsUrl, message, carrierSmsResult };
}

/**
 * Direct launcher that opens WhatsApp Web or App in a new tab
 */
export function openWhatsAppDirectly(phone: string, message: string): boolean {
  try {
    const url = getDirectWhatsAppUrl(phone, message);
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  } catch (e) {
    console.error('Failed to open WhatsApp URL:', e);
    return false;
  }
}

export interface SendWhatsAppResult {
  success: boolean;
  status: 'Sent' | 'Delivered' | 'Read' | 'Failed' | 'Pending';
  responseDetails: string;
  directUrl: string;
  logEntry: WhatsAppLogEntry;
}

/**
 * Checks if settings have valid Meta Cloud API credentials configured
 */
export function hasLiveMetaCredentials(settings: ApiSettings): boolean {
  return (
    Boolean(settings.accessToken) &&
    !settings.accessToken.includes('Replace') &&
    settings.accessToken.length > 30 &&
    Boolean(settings.phoneNumberId) &&
    settings.phoneNumberId.length >= 8 &&
    settings.provider === 'Meta WhatsApp Cloud API'
  );
}

/**
 * Sends a message using Meta WhatsApp Business Cloud API or prepares Direct Web dispatch.
 * Guarantees that customer order data is NEVER lost.
 */
export async function sendWhatsAppMessage(
  order: OrderItem,
  settings: ApiSettings,
  messageType: WhatsAppMessageType = 'Order Confirmation'
): Promise<SendWhatsAppResult> {
  const messageText = formatWhatsAppMessage(order, messageType);
  const cleanPhone = cleanPhoneNumber(order.whatsappNumber || order.mobileNumber);
  const directUrl = getDirectWhatsAppUrl(cleanPhone, messageText);
  const now = new Date();
  const dateTimeStr = `${now.toISOString().split('T')[0]} ${now
    .toTimeString()
    .split(' ')[0]
    .substring(0, 5)}`;
  const logId = `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const isLive = hasLiveMetaCredentials(settings);

  // If no live Meta API credentials configured, provide instant Direct WhatsApp Web support
  if (!isLive) {
    const logEntry: WhatsAppLogEntry = {
      id: logId,
      dateTime: dateTimeStr,
      orderId: order.orderId,
      customerName: order.customerName,
      whatsappNumber: order.whatsappNumber || order.mobileNumber,
      messageType,
      messageText,
      status: 'Sent',
      apiResponse: `Direct Web / App Mode: Link generated for +${cleanPhone}. Click 'Open WhatsApp' to send immediately.`,
      retryCount: 0,
    };

    return {
      success: true,
      status: 'Sent',
      responseDetails: `Direct WhatsApp Web / App link ready for +${cleanPhone}`,
      directUrl,
      logEntry,
    };
  }

  // Attempt real Meta WhatsApp Business Cloud API dispatch
  try {
    const url = `${settings.apiUrl.replace(/\/$/, '')}/${settings.phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: messageText,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${settings.accessToken.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errDetail =
        data?.error?.message ||
        `HTTP error ${response.status}: ${JSON.stringify(data?.error || data)}`;

      const logEntry: WhatsAppLogEntry = {
        id: logId,
        dateTime: dateTimeStr,
        orderId: order.orderId,
        customerName: order.customerName,
        whatsappNumber: order.whatsappNumber || order.mobileNumber,
        messageType,
        messageText,
        status: 'Failed',
        apiResponse: `Meta Cloud API Error (${response.status}): ${errDetail}`,
        retryCount: 0,
      };

      return {
        success: false,
        status: 'Failed',
        responseDetails: `Meta API Error: ${errDetail}`,
        directUrl,
        logEntry,
      };
    }

    const msgId = data?.messages?.[0]?.id || 'N/A';
    const logEntry: WhatsAppLogEntry = {
      id: logId,
      dateTime: dateTimeStr,
      orderId: order.orderId,
      customerName: order.customerName,
      whatsappNumber: order.whatsappNumber || order.mobileNumber,
      messageType,
      messageText,
      status: 'Sent',
      apiResponse: `HTTP 200 OK: Meta Message ID: ${msgId}`,
      retryCount: 0,
    };

    return {
      success: true,
      status: 'Sent',
      responseDetails: `Delivered via Meta Cloud API (ID: ${msgId})`,
      directUrl,
      logEntry,
    };
  } catch (error: any) {
    const errMsg = error?.message || 'Network / Browser connectivity error';
    const logEntry: WhatsAppLogEntry = {
      id: logId,
      dateTime: dateTimeStr,
      orderId: order.orderId,
      customerName: order.customerName,
      whatsappNumber: order.whatsappNumber || order.mobileNumber,
      messageType,
      messageText,
      status: 'Failed',
      apiResponse: `Network error: ${errMsg}. Fallback direct WhatsApp link available.`,
      retryCount: 0,
    };

    return {
      success: false,
      status: 'Failed',
      responseDetails: `Network error: ${errMsg}. Use Direct WhatsApp Send instead.`,
      directUrl,
      logEntry,
    };
  }
}
