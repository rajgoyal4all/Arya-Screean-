import {
  InventoryItem,
  FinanceTransaction,
  DayWiseSummary,
  MonthlySummary,
  InventoryCategory,
} from '../types';

const INVENTORY_STORAGE_KEY = 'arya_screen_inventory_v1';
const FINANCE_STORAGE_KEY = 'arya_screen_finance_txns_v1';

export const INVENTORY_CATEGORIES: InventoryCategory[] = [
  'Flex Rolls',
  'Vinyl & Film',
  'Solvent Inks',
  'Paper & Cards',
  'Hardware & Eyelets',
  'Display & Frames',
  'Chemicals & Cleaning',
  'Machine Parts',
  'Packaging & Tape',
  'Other',
];

export const INCOME_CATEGORIES = [
  'Flex Printing',
  'Banner & Hoarding',
  'Visiting & Wedding Cards',
  'Vinyl & Stickers',
  'DTP & Designing',
  'Job Work / Printing',
  'Stock Material Sale',
  'Finishing & Lamination',
  'Other Income',
];

export const EXPENSE_CATEGORIES = [
  'Raw Material Purchase',
  'Ink & Chemical Refill',
  'Machine Maintenance & Parts',
  'Electricity & Utilities',
  'Shop Rent & Internet',
  'Staff Wages & Advance',
  'Transportation / Delivery',
  'Tea & Refreshments',
  'Packaging Supplies',
  'Other Expense',
];

export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 'INV-101',
    name: 'Star Frontlit Flex (240 GSM, 10ft Roll)',
    category: 'Flex Rolls',
    currentStock: 12,
    unit: 'Rolls',
    minStockAlert: 3,
    purchaseCost: 1850,
    sellingPrice: 2600,
    location: 'Rack A1 - Main Flex Storage',
    supplier: 'Radhey Vinyl Hub, Raipur',
    lastRestocked: '2026-10-18',
    notes: 'Standard 240 GSM frontlit roll for outdoor banners',
  },
  {
    id: 'INV-102',
    name: 'Heavy Star Frontlit Flex (340 GSM, 10ft Roll)',
    category: 'Flex Rolls',
    currentStock: 7,
    unit: 'Rolls',
    minStockAlert: 2,
    purchaseCost: 2600,
    sellingPrice: 3800,
    location: 'Rack A2 - Heavy Duty Storage',
    supplier: 'Radhey Vinyl Hub, Raipur',
    lastRestocked: '2026-10-14',
    notes: 'Durable 340 GSM flex for long-term hoardings',
  },
  {
    id: 'INV-103',
    name: 'Korean Backlit Flex (10ft Roll)',
    category: 'Flex Rolls',
    currentStock: 4,
    unit: 'Rolls',
    minStockAlert: 2,
    purchaseCost: 3400,
    sellingPrice: 4900,
    location: 'Rack A3 - Lightbox Storage',
    supplier: 'Krishna Media Supplies',
    lastRestocked: '2026-10-08',
    notes: 'Premium light diffusion for glow-sign boards',
  },
  {
    id: 'INV-104',
    name: 'Self-Adhesive Glossy Vinyl (4ft x 50m Roll)',
    category: 'Vinyl & Film',
    currentStock: 6,
    unit: 'Rolls',
    minStockAlert: 2,
    purchaseCost: 2100,
    sellingPrice: 3200,
    location: 'Rack B1 - Vinyl Section',
    supplier: 'Avery Media Hub',
    lastRestocked: '2026-10-16',
    notes: 'High tack outdoor adhesive vinyl',
  },
  {
    id: 'INV-105',
    name: 'One-Way Vision Perforated Film (5ft Roll)',
    category: 'Vinyl & Film',
    currentStock: 2,
    unit: 'Rolls',
    minStockAlert: 2,
    purchaseCost: 2800,
    sellingPrice: 4200,
    location: 'Rack B2 - Specialty Films',
    supplier: 'Avery Media Hub',
    lastRestocked: '2026-10-02',
    notes: 'Glass window graphics film (low stock alert)',
  },
  {
    id: 'INV-106',
    name: 'Solvent Cyan Ink (5L Bottle)',
    category: 'Solvent Inks',
    currentStock: 5,
    unit: 'Liters',
    minStockAlert: 2,
    purchaseCost: 1600,
    sellingPrice: 2200,
    location: 'Ink Cabinet - C1',
    supplier: 'Surat Ink Chemical Works',
    lastRestocked: '2026-10-15',
    notes: 'High gloss, anti-clog Konica 512i compatible',
  },
  {
    id: 'INV-107',
    name: 'Solvent Magenta Ink (5L Bottle)',
    category: 'Solvent Inks',
    currentStock: 4,
    unit: 'Liters',
    minStockAlert: 2,
    purchaseCost: 1600,
    sellingPrice: 2200,
    location: 'Ink Cabinet - M1',
    supplier: 'Surat Ink Chemical Works',
    lastRestocked: '2026-10-15',
    notes: 'Vibrant shade for skin tone and wedding banners',
  },
  {
    id: 'INV-108',
    name: 'Solvent Yellow Ink (5L Bottle)',
    category: 'Solvent Inks',
    currentStock: 6,
    unit: 'Liters',
    minStockAlert: 2,
    purchaseCost: 1600,
    sellingPrice: 2200,
    location: 'Ink Cabinet - Y1',
    supplier: 'Surat Ink Chemical Works',
    lastRestocked: '2026-10-15',
    notes: 'Fast drying outdoor pigment',
  },
  {
    id: 'INV-109',
    name: 'Solvent Black Ink (5L Bottle)',
    category: 'Solvent Inks',
    currentStock: 6,
    unit: 'Liters',
    minStockAlert: 2,
    purchaseCost: 1600,
    sellingPrice: 2200,
    location: 'Ink Cabinet - K1',
    supplier: 'Surat Ink Chemical Works',
    lastRestocked: '2026-10-15',
    notes: 'Deep rich black for text and contrasts',
  },
  {
    id: 'INV-110',
    name: 'Printhead Cleaning Solvent Solution (5L)',
    category: 'Chemicals & Cleaning',
    currentStock: 3,
    unit: 'Liters',
    minStockAlert: 1,
    purchaseCost: 950,
    sellingPrice: 1400,
    location: 'Chemical Storage Under Bench',
    supplier: 'Techno Spares Kolkata',
    lastRestocked: '2026-10-10',
    notes: 'For daily head flush and ultrasonic cleaning',
  },
  {
    id: 'INV-111',
    name: 'Heavy Brass Eyelets / Rings (#4 1000 Pcs)',
    category: 'Hardware & Eyelets',
    currentStock: 9,
    unit: 'Packets',
    minStockAlert: 3,
    purchaseCost: 380,
    sellingPrice: 650,
    location: 'Finishing Table Bin 1',
    supplier: 'Grommet Craft Industries',
    lastRestocked: '2026-10-19',
    notes: 'Rust-proof gold brass for banner borders',
  },
  {
    id: 'INV-112',
    name: 'Art Card 350 GSM (Packet of 500 Sheets)',
    category: 'Paper & Cards',
    currentStock: 14,
    unit: 'Packets',
    minStockAlert: 4,
    purchaseCost: 1150,
    sellingPrice: 1750,
    location: 'DTP Paper Shelf 3',
    supplier: 'Ballarpur Paper Agency',
    lastRestocked: '2026-10-12',
    notes: 'Ideal for premium visiting cards and certificates',
  },
  {
    id: 'INV-113',
    name: 'Sunboard Foam Sheet 3mm (8x4 ft)',
    category: 'Display & Frames',
    currentStock: 22,
    unit: 'Sheets',
    minStockAlert: 8,
    purchaseCost: 320,
    sellingPrice: 550,
    location: 'Wall Vertical Stand A',
    supplier: 'Shree Sai Foam Mart',
    lastRestocked: '2026-10-17',
    notes: 'Rigid backing for vinyl photo posters and direction boards',
  },
  {
    id: 'INV-114',
    name: 'Rollup Standee Aluminum Mechanism (6x3 ft)',
    category: 'Display & Frames',
    currentStock: 11,
    unit: 'Pcs',
    minStockAlert: 4,
    purchaseCost: 450,
    sellingPrice: 850,
    location: 'Standee Box Section',
    supplier: 'Display Pro Delhi',
    lastRestocked: '2026-10-11',
    notes: 'Includes carry bag and top hanger clip',
  },
];

export const INITIAL_FINANCE_TRANSACTIONS: FinanceTransaction[] = [
  // Today / Recent October 2026
  {
    id: 'TXN-2026-1001',
    date: '2026-10-23',
    time: '10:15',
    type: 'income',
    category: 'Flex Printing',
    itemId: 'INV-101',
    itemName: 'Star Frontlit Flex (12x4 ft Shop Banner)',
    quantity: 48,
    unit: 'sq.ft',
    unitPrice: 12,
    amount: 576,
    paymentMode: 'UPI / GPay / PhonePe',
    partyName: 'Maa Samaleswari Traders',
    referenceOrderId: 'ARYA-2026-0001',
    invoiceNumber: 'INV/26-27/0881',
    notes: 'Bargarh main road shop board printing',
    affectsStock: true,
  },
  {
    id: 'TXN-2026-1002',
    date: '2026-10-23',
    time: '11:30',
    type: 'income',
    category: 'Visiting & Wedding Cards',
    itemId: 'INV-112',
    itemName: '350 GSM Matte Laminated Visiting Cards',
    quantity: 1000,
    unit: 'Pcs',
    unitPrice: 0.85,
    amount: 850,
    paymentMode: 'Cash',
    partyName: 'Suresh Agrawal (CA)',
    referenceOrderId: 'ARYA-2026-0003',
    invoiceNumber: 'INV/26-27/0882',
    notes: 'Both sides multicolor print with rounded corners',
  },
  {
    id: 'TXN-2026-1003',
    date: '2026-10-23',
    time: '12:45',
    type: 'expense',
    category: 'Tea & Refreshments',
    itemName: 'Tea & Snacks for Printing Crew & Visitors',
    quantity: 1,
    unit: 'Day',
    unitPrice: 180,
    amount: 180,
    paymentMode: 'Cash',
    partyName: 'Naveen Chai Corner',
    notes: 'Morning & afternoon tea for operators',
  },
  {
    id: 'TXN-2026-1004',
    date: '2026-10-23',
    time: '14:20',
    type: 'income',
    category: 'Display & Frames',
    itemId: 'INV-114',
    itemName: 'Rollup Standee (6x3 ft Star Flex complete)',
    quantity: 2,
    unit: 'Pcs',
    unitPrice: 1250,
    amount: 2500,
    paymentMode: 'UPI / GPay / PhonePe',
    partyName: 'Kalyan Jewellers Bargarh',
    referenceOrderId: 'ARYA-2026-0005',
    notes: 'Festive promotion standee with stand mechanism',
  },
  {
    id: 'TXN-2026-1005',
    date: '2026-10-23',
    time: '16:00',
    type: 'expense',
    category: 'Machine Maintenance & Parts',
    itemId: 'INV-110',
    itemName: 'Solvent Printhead Ultrasonic Flush & Wipers',
    quantity: 1,
    unit: 'Job',
    unitPrice: 450,
    amount: 450,
    paymentMode: 'Cash',
    partyName: 'Techno Care Maintenance',
    notes: 'Routine nozzle recovery & cleaning',
  },
  {
    id: 'TXN-2026-1006',
    date: '2026-10-22',
    time: '11:00',
    type: 'income',
    category: 'Flex Printing',
    itemId: 'INV-102',
    itemName: 'Heavy Star Frontlit Flex (20x10 ft Billboard)',
    quantity: 200,
    unit: 'sq.ft',
    unitPrice: 14,
    amount: 2800,
    paymentMode: 'Bank Transfer',
    partyName: 'Garg Automobiles Bargarh',
    referenceOrderId: 'ARYA-2026-0002',
    invoiceNumber: 'INV/26-27/0879',
    notes: 'Eyelets on all sides, rope stitching included',
  },
  {
    id: 'TXN-2026-1007',
    date: '2026-10-22',
    time: '15:10',
    type: 'income',
    category: 'Vinyl & Stickers',
    itemId: 'INV-104',
    itemName: 'Glossy Vinyl + 3mm Sunboard Signboard',
    quantity: 40,
    unit: 'sq.ft',
    unitPrice: 45,
    amount: 1800,
    paymentMode: 'UPI / GPay / PhonePe',
    partyName: 'Dr. R. K. Tripathy Clinic',
    notes: 'Reception clinic timing board',
  },
  {
    id: 'TXN-2026-1008',
    date: '2026-10-22',
    time: '18:30',
    type: 'expense',
    category: 'Staff Wages & Advance',
    itemName: 'Designer Weekly Advance - Ramesh Sharma',
    quantity: 1,
    unit: 'Payment',
    unitPrice: 3000,
    amount: 3000,
    paymentMode: 'UPI / GPay / PhonePe',
    partyName: 'Ramesh Sharma (Designer)',
    notes: 'Advance for festive peak rush week',
  },
  {
    id: 'TXN-2026-1009',
    date: '2026-10-21',
    time: '09:40',
    type: 'expense',
    category: 'Ink & Chemical Refill',
    itemId: 'INV-106',
    itemName: 'Solvent Cyan & Black Ink Refill (2 Cans)',
    quantity: 2,
    unit: 'Liters',
    unitPrice: 1600,
    amount: 3200,
    paymentMode: 'Bank Transfer',
    partyName: 'Surat Ink Chemical Works',
    invoiceNumber: 'SICW-8821',
    notes: 'Stock replenishment for flex machine',
    affectsStock: true,
  },
  {
    id: 'TXN-2026-1010',
    date: '2026-10-21',
    time: '13:00',
    type: 'income',
    category: 'DTP & Designing',
    itemName: 'CorelDRAW Brochure & Logo Redesign Work',
    quantity: 1,
    unit: 'Job',
    unitPrice: 750,
    amount: 750,
    paymentMode: 'Cash',
    partyName: 'Pradhan Builders',
    notes: 'Design file exported to CDR and PDF',
  },
  {
    id: 'TXN-2026-1011',
    date: '2026-10-20',
    time: '10:30',
    type: 'income',
    category: 'Visiting & Wedding Cards',
    itemName: 'Premium Golden Embossed Wedding Cards',
    quantity: 350,
    unit: 'Pcs',
    unitPrice: 18,
    amount: 6300,
    paymentMode: 'Bank Transfer',
    partyName: 'Birendra & Sunita Wedding',
    referenceOrderId: 'ARYA-2026-0004',
    invoiceNumber: 'INV/26-27/0875',
    notes: 'Royal red paper with golden screen foil print',
  },
  {
    id: 'TXN-2026-1012',
    date: '2026-10-20',
    time: '17:15',
    type: 'expense',
    category: 'Electricity & Utilities',
    itemName: 'Shop 3-Phase Commercial Electricity Bill',
    quantity: 1,
    unit: 'Month',
    unitPrice: 2860,
    amount: 2860,
    paymentMode: 'UPI / GPay / PhonePe',
    partyName: 'TPWODL Bargarh Division',
    invoiceNumber: 'EB-2026-10-994',
    notes: 'Power bill for flex heaters and chiller unit',
  },
  {
    id: 'TXN-2026-1013',
    date: '2026-10-18',
    time: '11:15',
    type: 'expense',
    category: 'Raw Material Purchase',
    itemId: 'INV-101',
    itemName: 'Star Frontlit Flex 10ft Rolls (3 Rolls)',
    quantity: 3,
    unit: 'Rolls',
    unitPrice: 1850,
    amount: 5550,
    paymentMode: 'Bank Transfer',
    partyName: 'Radhey Vinyl Hub, Raipur',
    invoiceNumber: 'RVH-10492',
    notes: 'Transport via Patel Cargo Sambalpur',
    affectsStock: true,
  },
  {
    id: 'TXN-2026-1014',
    date: '2026-10-18',
    time: '15:45',
    type: 'income',
    category: 'Flex Printing',
    itemId: 'INV-101',
    itemName: 'Star Frontlit Election & Puja Gate Banners',
    quantity: 340,
    unit: 'sq.ft',
    unitPrice: 11,
    amount: 3740,
    paymentMode: 'Cash',
    partyName: 'Durga Puja Samiti Bargarh',
    notes: 'Welcome arches and gate flex prints',
  },
  {
    id: 'TXN-2026-1015',
    date: '2026-10-17',
    time: '12:00',
    type: 'income',
    category: 'Stock Material Sale',
    itemId: 'INV-104',
    itemName: 'Over-The-Counter Glossy Vinyl Roll Sale',
    quantity: 1,
    unit: 'Rolls',
    unitPrice: 3200,
    amount: 3200,
    paymentMode: 'UPI / GPay / PhonePe',
    partyName: 'Graphic Point Jharsuguda',
    notes: 'Urgent wholesale supply to associate print shop',
    affectsStock: true,
  },
  {
    id: 'TXN-2026-1016',
    date: '2026-10-16',
    time: '14:30',
    type: 'expense',
    category: 'Shop Rent & Internet',
    itemName: 'Commercial Fiber Internet & Corel Cloud Subscription',
    quantity: 1,
    unit: 'Month',
    unitPrice: 899,
    amount: 899,
    paymentMode: 'UPI / GPay / PhonePe',
    partyName: 'JioFiber Business Sambalpur',
    notes: '300 Mbps unlimited for fast artwork downloads',
  },
  {
    id: 'TXN-2026-1017',
    date: '2026-10-15',
    time: '16:00',
    type: 'expense',
    category: 'Raw Material Purchase',
    itemId: 'INV-111',
    itemName: 'Heavy Brass Eyelets & Double Tape Stock',
    quantity: 4,
    unit: 'Packets',
    unitPrice: 380,
    amount: 1520,
    paymentMode: 'Cash',
    partyName: 'Grommet Craft Industries',
    notes: 'Finishing consumables',
  },
  {
    id: 'TXN-2026-1018',
    date: '2026-10-15',
    time: '17:30',
    type: 'income',
    category: 'Flex Printing',
    itemName: 'Highway Hotel Billboard Flex (30x12 ft)',
    quantity: 360,
    unit: 'sq.ft',
    unitPrice: 13,
    amount: 4680,
    paymentMode: 'Bank Transfer',
    partyName: 'Hotel Samaleswari Highway',
    notes: '340 GSM heavy flex with heat welded borders',
  },
];

// LocalStorage accessors
export function getStoredInventoryItems(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) {
      saveStoredInventoryItems(INITIAL_INVENTORY_ITEMS);
      return INITIAL_INVENTORY_ITEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_INVENTORY_ITEMS;
  } catch (e) {
    console.error('Error loading inventory items from localStorage:', e);
    return INITIAL_INVENTORY_ITEMS;
  }
}

export function saveStoredInventoryItems(items: InventoryItem[]): void {
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving inventory items to localStorage:', e);
  }
}

export function getStoredFinanceTransactions(): FinanceTransaction[] {
  try {
    const raw = localStorage.getItem(FINANCE_STORAGE_KEY);
    if (!raw) {
      saveStoredFinanceTransactions(INITIAL_FINANCE_TRANSACTIONS);
      return INITIAL_FINANCE_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FINANCE_TRANSACTIONS;
  } catch (e) {
    console.error('Error loading finance transactions from localStorage:', e);
    return INITIAL_FINANCE_TRANSACTIONS;
  }
}

export function saveStoredFinanceTransactions(txns: FinanceTransaction[]): void {
  try {
    localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(txns));
  } catch (e) {
    console.error('Error saving finance transactions to localStorage:', e);
  }
}

// Day-wise calculations
export function getDayWiseSummary(dateStr: string, txns: FinanceTransaction[]): DayWiseSummary {
  const dayTxns = txns.filter((t) => t.date === dateStr);
  let totalIncome = 0;
  let totalExpense = 0;
  let incomeCount = 0;
  let expenseCount = 0;
  let cashIncome = 0;
  let cashExpense = 0;
  let upiIncome = 0;
  let upiExpense = 0;
  let bankIncome = 0;
  let bankExpense = 0;

  for (const t of dayTxns) {
    if (t.type === 'income') {
      totalIncome += t.amount;
      incomeCount += 1;
      if (t.paymentMode === 'Cash') cashIncome += t.amount;
      else if (t.paymentMode === 'UPI / GPay / PhonePe') upiIncome += t.amount;
      else bankIncome += t.amount;
    } else {
      totalExpense += t.amount;
      expenseCount += 1;
      if (t.paymentMode === 'Cash') cashExpense += t.amount;
      else if (t.paymentMode === 'UPI / GPay / PhonePe') upiExpense += t.amount;
      else bankExpense += t.amount;
    }
  }

  return {
    date: dateStr,
    totalIncome,
    totalExpense,
    netProfit: totalIncome - totalExpense,
    transactionCount: dayTxns.length,
    incomeCount,
    expenseCount,
    cashIncome,
    cashExpense,
    upiIncome,
    upiExpense,
    bankIncome,
    bankExpense,
  };
}

// Monthly calculations
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function getMonthlySummary(
  year: number,
  month: number, // 1 to 12
  txns: FinanceTransaction[]
): MonthlySummary {
  const monthStr = String(month).padStart(2, '0');
  const prefix = `${year}-${monthStr}`;

  const monthTxns = txns.filter((t) => t.date.startsWith(prefix));

  let totalIncome = 0;
  let totalExpense = 0;

  const incomeItemsMap: { [key: string]: { totalAmount: number; count: number; category: string } } = {};
  const expenseItemsMap: { [key: string]: { totalAmount: number; count: number; category: string } } = {};

  const incomeCatMap: { [category: string]: number } = {};
  const expenseCatMap: { [category: string]: number } = {};

  const daysSet = new Set<string>();

  for (const t of monthTxns) {
    daysSet.add(t.date);
    if (t.type === 'income') {
      totalIncome += t.amount;
      incomeCatMap[t.category] = (incomeCatMap[t.category] || 0) + t.amount;

      const key = t.itemName.trim() || t.category;
      if (!incomeItemsMap[key]) {
        incomeItemsMap[key] = { totalAmount: 0, count: 0, category: t.category };
      }
      incomeItemsMap[key].totalAmount += t.amount;
      incomeItemsMap[key].count += 1;
    } else {
      totalExpense += t.amount;
      expenseCatMap[t.category] = (expenseCatMap[t.category] || 0) + t.amount;

      const key = t.itemName.trim() || t.category;
      if (!expenseItemsMap[key]) {
        expenseItemsMap[key] = { totalAmount: 0, count: 0, category: t.category };
      }
      expenseItemsMap[key].totalAmount += t.amount;
      expenseItemsMap[key].count += 1;
    }
  }

  const netProfit = totalIncome - totalExpense;
  const profitMarginPercent = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
  const daysCount = daysSet.size || 1;

  const topIncomeItems = Object.entries(incomeItemsMap)
    .map(([itemName, data]) => ({
      itemName,
      totalAmount: data.totalAmount,
      count: data.count,
      category: data.category,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);

  const topExpenseItems = Object.entries(expenseItemsMap)
    .map(([itemName, data]) => ({
      itemName,
      totalAmount: data.totalAmount,
      count: data.count,
      category: data.category,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);

  return {
    year,
    month,
    monthLabel: `${MONTH_NAMES[month - 1]} ${year}`,
    totalIncome,
    totalExpense,
    netProfit,
    profitMarginPercent,
    dailyAverages: {
      income: Math.round(totalIncome / daysCount),
      expense: Math.round(totalExpense / daysCount),
      profit: Math.round(netProfit / daysCount),
    },
    totalDaysWithTransactions: daysSet.size,
    topIncomeItems,
    topExpenseItems,
    categoryBreakdown: {
      income: incomeCatMap,
      expense: expenseCatMap,
    },
  };
}

// CSV Exporters
export function exportTransactionsToCSV(txns: FinanceTransaction[], filename = 'AryaScreen_Transactions.csv'): void {
  const headers = [
    'Txn ID',
    'Date',
    'Time',
    'Type',
    'Category',
    'Item Name (Item-Wise)',
    'Quantity',
    'Unit',
    'Unit Price (INR)',
    'Total Amount (INR)',
    'Payment Mode',
    'Party / Customer / Vendor',
    'Order Ref',
    'Notes',
  ];

  const rows = txns.map((t) => [
    t.id,
    t.date,
    t.time || '',
    t.type.toUpperCase(),
    `"${(t.category || '').replace(/"/g, '""')}"`,
    `"${(t.itemName || '').replace(/"/g, '""')}"`,
    t.quantity,
    t.unit,
    t.unitPrice,
    t.amount,
    t.paymentMode,
    `"${(t.partyName || '').replace(/"/g, '""')}"`,
    t.referenceOrderId || '',
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportInventoryToCSV(items: InventoryItem[], filename = 'AryaScreen_Inventory.csv'): void {
  const headers = [
    'Item Code',
    'Item Name',
    'Category',
    'Current Stock',
    'Unit',
    'Min Stock Alert',
    'Purchase Cost (INR)',
    'Selling Rate (INR)',
    'Stock Value (INR)',
    'Location',
    'Supplier',
    'Last Restocked',
  ];

  const rows = items.map((i) => [
    i.id,
    `"${(i.name || '').replace(/"/g, '""')}"`,
    `"${(i.category || '').replace(/"/g, '""')}"`,
    i.currentStock,
    i.unit,
    i.minStockAlert,
    i.purchaseCost,
    i.sellingPrice,
    i.currentStock * i.purchaseCost,
    `"${(i.location || '').replace(/"/g, '""')}"`,
    `"${(i.supplier || '').replace(/"/g, '""')}"`,
    i.lastRestocked,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
