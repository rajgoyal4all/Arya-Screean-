import React, { useState, useEffect, useCallback } from 'react';
import {
  OrderItem,
  WhatsAppLogEntry,
  ApiSettings,
  ShopProfile,
  ActiveTab,
  OrderStatus,
  PaymentMethod,
  Designer,
  WorkTypeItem,
  WorkSample,
  AuthUser,
} from './types';
import {
  getStoredOrders,
  saveStoredOrders,
  getStoredWhatsAppLogs,
  saveStoredWhatsAppLogs,
  getStoredApiSettings,
  saveStoredApiSettings,
  getStoredShopProfile,
  saveStoredShopProfile,
  clearAllStoredData,
  restoreSampleData,
  getStoredDesigners,
  saveStoredDesigners,
  addStoredDesigner,
  removeStoredDesigner,
  DEFAULT_DESIGNERS,
  getStoredDesignerProfiles,
  saveStoredDesignerProfiles,
  addStoredDesignerProfile,
  updateStoredDesignerProfile,
  removeStoredDesignerProfile,
  getStoredWorkTypes,
  addStoredWorkType,
  updateStoredWorkType,
  deleteStoredWorkType,
  addSampleToWorkType,
  deleteSampleFromWorkType,
  getStoredAuthUser,
  saveStoredAuthUser,
  clearStoredAuthUser,
  ADMIN_MOBILE,
} from './utils/storage';
import { exportToExcelWorkbook } from './utils/excelExporter';
import {
  sendWhatsAppMessage,
  formatWhatsAppMessage,
  getDirectWhatsAppUrl,
  WhatsAppMessageType,
} from './utils/whatsapp';

import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { NewOrderForm } from './components/NewOrderForm';
import { CustomerDatabase } from './components/CustomerDatabase';
import { DesignerDatabase } from './components/DesignerDatabase';
import { WorkTypesCatalog } from './components/WorkTypesCatalog';
import { CalendarView } from './components/CalendarView';
import { WorkOrders } from './components/WorkOrders';
import { SearchSystem } from './components/SearchSystem';
import { PaymentsSheet } from './components/PaymentsSheet';
import { WhatsAppLogSheet } from './components/WhatsAppLogSheet';
import { ApiSettingsSheet } from './components/ApiSettingsSheet';
import { PrintableReceipt } from './components/PrintableReceipt';
import { VbaModal } from './components/VbaModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { DeleteConfirmModal, DeleteTarget } from './components/DeleteConfirmModal';
import { ChangeLogoModal } from './components/ChangeLogoModal';
import { AuthModal } from './components/AuthModal';
import { CustomerOrdersView } from './components/CustomerOrdersView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<'customer' | 'admin'>('customer');
  const [authModalAction, setAuthModalAction] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const auth = getStoredAuthUser();
    if (!auth) return 'work_types';
    return auth.role === 'customer' ? 'customer_orders' : 'dashboard';
  });
  const [orders, setOrders] = useState<OrderItem[]>(() => getStoredOrders());
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppLogEntry[]>(() => getStoredWhatsAppLogs());
  const [apiSettings, setApiSettings] = useState<ApiSettings>(() => getStoredApiSettings());
  const [shopProfile, setShopProfile] = useState<ShopProfile>(() => getStoredShopProfile());
  const [designerProfiles, setDesignerProfiles] = useState<Designer[]>(() => getStoredDesignerProfiles());
  const [designers, setDesigners] = useState<string[]>(() => {
    const profiles = getStoredDesignerProfiles();
    return profiles.length > 0
      ? profiles.map((p) => `${p.name} (${p.role})`)
      : getStoredDesigners();
  });
  const [workTypes, setWorkTypes] = useState<WorkTypeItem[]>(() => getStoredWorkTypes());
  const [preselectedWorkTypeForOrder, setPreselectedWorkTypeForOrder] = useState<string>('');
  const [preselectedDeliveryDateForOrder, setPreselectedDeliveryDateForOrder] = useState<string>('');

  // Modal States
  const [receiptOrder, setReceiptOrder] = useState<OrderItem | null>(null);
  const [whatsAppModalOrder, setWhatsAppModalOrder] = useState<OrderItem | null>(null);
  const [initialWhatsAppMessageType, setInitialWhatsAppMessageType] = useState<
    WhatsAppMessageType | undefined
  >(undefined);
  const [isVbaModalOpen, setIsVbaModalOpen] = useState(false);
  const [isChangeLogoModalOpen, setIsChangeLogoModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [quickNotification, setQuickNotification] = useState<{
    text: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  // Persistence effects
  useEffect(() => {
    saveStoredOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveStoredWhatsAppLogs(whatsappLogs);
  }, [whatsappLogs]);

  useEffect(() => {
    saveStoredApiSettings(apiSettings);
  }, [apiSettings]);

  useEffect(() => {
    saveStoredShopProfile(shopProfile);
  }, [shopProfile]);

  useEffect(() => {
    saveStoredDesigners(designers);
  }, [designers]);

  useEffect(() => {
    saveStoredDesignerProfiles(designerProfiles);
  }, [designerProfiles]);

  useEffect(() => {
    saveStoredAuthUser(currentUser);
  }, [currentUser]);

  // Enforce customer & guest access: Restrict tabs accordingly
  useEffect(() => {
    if (currentUser?.role === 'customer') {
      const allowedCustomerTabs: ActiveTab[] = [
        'work_types',
        'customer_orders',
        'new_order',
      ];
      if (!allowedCustomerTabs.includes(activeTab)) {
        setActiveTab('customer_orders');
      }
    } else if (!currentUser) {
      const allowedGuestTabs: ActiveTab[] = [
        'work_types',
        'customer_orders',
        'new_order',
      ];
      if (!allowedGuestTabs.includes(activeTab)) {
        setActiveTab('work_types');
      }
    }
  }, [currentUser, activeTab]);

  const handleOpenCustomerLogin = useCallback((action?: string) => {
    setAuthModalRole('customer');
    setAuthModalAction(action || 'Creating Order');
    setIsAuthModalOpen(true);
  }, []);

  const handleOpenAdminLogin = useCallback(() => {
    setAuthModalRole('admin');
    setAuthModalAction(undefined);
    setIsAuthModalOpen(true);
  }, []);

  const handleLoginSuccess = useCallback((user: AuthUser) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    if (user.role === 'customer') {
      setActiveTab('new_order');
      showNotification(`Verified Customer: ${user.name} (+91 ${user.mobileNumber})`, 'success');
    } else {
      setActiveTab('dashboard');
      showNotification('Admin Login Successful: Pramod Sagria (9938109624) with full control', 'success');
    }
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    clearStoredAuthUser();
    setActiveTab('work_types');
    showNotification('Logged out successfully', 'info');
  };

  const handleSwitchToCustomerView = () => {
    const demoCustomer: AuthUser = {
      role: 'customer',
      mobileNumber: '9837123450',
      name: 'Shri Radhey Sweets (Mr. Manoj Sharma)',
      customerId: 'CUST-1001',
      loginTime: new Date().toISOString(),
    };
    setCurrentUser(demoCustomer);
    setActiveTab('customer_orders');
    showNotification('Switched to Customer View: Shri Radhey Sweets (9837123450)', 'info');
  };

  const showNotification = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setQuickNotification({ text, type });
    setTimeout(() => setQuickNotification(null), 4000);
  };

  // Handlers for Designers
  const handleAddDesigner = (newDesignerName: string) => {
    const updated = addStoredDesigner(newDesignerName);
    setDesigners(updated);
    // Also create a profile
    const newProfile: Omit<Designer, 'id'> = {
      name: newDesignerName.split('(')[0].trim(),
      role: newDesignerName.includes('(') ? newDesignerName.split('(')[1].replace(')', '').trim() : 'Designer',
      phone: '9876543210',
      email: `${newDesignerName.split('(')[0].trim().toLowerCase().replace(/\s+/g, '.')}@aryascreen.in`,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      skills: ['Graphic Design', 'CorelDRAW'],
      dailyCapacity: 8,
    };
    const updatedProfiles = addStoredDesignerProfile(newProfile);
    setDesignerProfiles(updatedProfiles);
    showNotification(`Added designer "${newDesignerName}" to Arya Screen team`, 'success');
  };

  const handleRemoveDesigner = (designerToRemove: string) => {
    const updated = removeStoredDesigner(designerToRemove);
    setDesigners(updated);
    showNotification(`Removed designer "${designerToRemove}" from roster`, 'info');
  };

  const handleRestoreDefaultDesigners = () => {
    saveStoredDesigners(DEFAULT_DESIGNERS);
    setDesigners(DEFAULT_DESIGNERS);
    const profiles = getStoredDesignerProfiles();
    setDesignerProfiles(profiles);
    showNotification('Restored Arya Screen standard operator team', 'success');
  };

  // Full Designer Database CRUD Handlers
  const handleAddDesignerProfile = (profileData: Omit<Designer, 'id'>) => {
    const updated = addStoredDesignerProfile(profileData);
    setDesignerProfiles(updated);
    const labelList = updated.map((p) => `${p.name} (${p.role})`);
    setDesigners(labelList);
    saveStoredDesigners(labelList);
    showNotification(`Registered "${profileData.name}" in Designer Database!`, 'success');
  };

  const handleUpdateDesignerProfile = (updatedProfile: Designer) => {
    const updated = updateStoredDesignerProfile(updatedProfile);
    setDesignerProfiles(updated);
    const labelList = updated.map((p) => `${p.name} (${p.role})`);
    setDesigners(labelList);
    saveStoredDesigners(labelList);
    showNotification(`Updated profile for "${updatedProfile.name}"`, 'success');
  };

  const handleDeleteDesignerProfile = (id: string) => {
    const target = designerProfiles.find((d) => d.id === id);
    const updated = removeStoredDesignerProfile(id);
    setDesignerProfiles(updated);
    const labelList = updated.map((p) => `${p.name} (${p.role})`);
    setDesigners(labelList);
    saveStoredDesigners(labelList);
    showNotification(`Removed designer "${target?.name || id}" from database`, 'info');
  };

  // Handler: New Order created
  const handleOrderCreated = (newOrder: OrderItem, log?: WhatsAppLogEntry) => {
    setOrders((prev) => [newOrder, ...prev]);
    if (log) {
      setWhatsappLogs((prev) => [log, ...prev]);
    }
    showNotification(`Order ${newOrder.orderId} registered in ARYA SCREEN Excel database!`, 'success');
  };

  // Handler: Update Order Status
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: newStatus } : o))
    );
    showNotification(`Order ${orderId} status changed to "${newStatus}"`, 'info');
  };

  // Handler: Reschedule Order (Calendar Drag & Drop / Date Picker)
  const handleRescheduleOrder = (orderId: string, newDeliveryDate: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, deliveryDate: newDeliveryDate } : o))
    );
    showNotification(`Order ${orderId} delivery rescheduled to ${newDeliveryDate}!`, 'success');
  };

  // Handler: Update Assigned Designer/Operator
  const handleUpdateDesigner = (orderId: string, designer: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, designerOperator: designer } : o))
    );
    showNotification(`Order ${orderId} assigned to ${designer}`, 'info');
  };

  // Handler: Update Payment collection
  const handleUpdatePayment = (
    orderId: string,
    additionalAmount: number,
    method: PaymentMethod
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderId === orderId) {
          const newAdvance = (o.advancePaid || 0) + additionalAmount;
          const newBalance = Math.max(0, o.amount - newAdvance);
          return {
            ...o,
            advancePaid: newAdvance,
            balanceAmount: newBalance,
            paymentStatus: newBalance === 0 ? 'Paid' : 'Partial',
            paymentMethod: method,
          };
        }
        return o;
      })
    );
    showNotification(`Payment of ₹${additionalAmount} recorded for Order ${orderId}`, 'success');
  };

  // Handler: Update WhatsApp Log
  const handleUpdateWhatsAppLog = (updatedLog: WhatsAppLogEntry) => {
    setWhatsappLogs((prev) => {
      const exists = prev.some((l) => l.id === updatedLog.id);
      if (exists) {
        return prev.map((l) => (l.id === updatedLog.id ? updatedLog : l));
      }
      return [updatedLog, ...prev];
    });

    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === updatedLog.orderId
          ? { ...o, whatsappStatus: updatedLog.status, whatsappResponse: updatedLog.apiResponse }
          : o
      )
    );
    showNotification(`WhatsApp log updated for ${updatedLog.orderId}`, 'success');
  };

  // Handler: Quick WhatsApp trigger - opens interactive dispatch modal
  const handleQuickWhatsApp = (order: OrderItem) => {
    setInitialWhatsAppMessageType(
      order.adminConfirmed ? 'Order Confirmed by Admin' : 'Order Confirmation'
    );
    setWhatsAppModalOrder(order);
  };

  // Handler: Confirm Order by Admin (Pramod Sagria)
  const handleConfirmOrder = (orderToConfirm: OrderItem) => {
    const now = new Date();
    const dateTimeStr = `${now.toISOString().split('T')[0]} ${now
      .toTimeString()
      .split(' ')[0]
      .substring(0, 5)}`;

    const updatedOrder: OrderItem = {
      ...orderToConfirm,
      adminConfirmed: true,
      orderStatus: 'Confirmed',
      confirmedAt: dateTimeStr,
      confirmedBy: 'Pramod Sagria (Admin - 9938109624)',
    };

    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderToConfirm.orderId ? updatedOrder : o))
    );

    setInitialWhatsAppMessageType('Order Confirmed by Admin');
    setWhatsAppModalOrder(updatedOrder);

    showNotification(
      `Order ${orderToConfirm.orderId} confirmed by Admin Pramod Sagria! Notification ready to send from 9938109624.`,
      'success'
    );
  };

  // Handler: Test WhatsApp
  const handleTestWhatsApp = async (targetPhone: string): Promise<boolean> => {
    const dummyOrder: OrderItem = {
      id: 'test_ord',
      orderId: 'ARYA-TEST-0001',
      customerId: 'CUST-TEST',
      dateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      customerName: 'Test Customer',
      mobileNumber: targetPhone,
      whatsappNumber: targetPhone,
      address: shopProfile.address,
      villageTown: shopProfile.villageTown,
      district: shopProfile.district,
      pincode: shopProfile.pincode,
      email: '',
      workType: 'Flex Printing',
      workDescription: 'Meta WhatsApp Cloud API Connectivity Test',
      width: '10',
      height: '4',
      sizeDimensions: '10x4 ft',
      quantity: 1,
      material: 'Star Backlit Flex',
      designFileName: 'test.cdr',
      designFileUploadOrLink: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      specialInstructions: 'Test Message',
      designerOperator: 'System Admin',
      amount: 500,
      advancePaid: 500,
      balanceAmount: 0,
      paymentStatus: 'Paid',
      paymentMethod: 'Cash',
      orderStatus: 'Ready',
      whatsappStatus: 'Sent',
      remarks: 'Test check',
    };

    const res = await sendWhatsAppMessage(dummyOrder, apiSettings);
    setWhatsappLogs((prev) => [res.logEntry, ...prev]);
    return res.success;
  };

  // Handler: Confirm Deletion / Clear Actions
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'all_database') {
      clearAllStoredData();
      setOrders([]);
      setWhatsappLogs([]);
      showNotification('Arya Screen database wiped clean. Next order will begin at ARYA-2026-0001.', 'info');
    } else if (deleteTarget.type === 'all_logs') {
      setWhatsappLogs([]);
      saveStoredWhatsAppLogs([]);
      showNotification('All WhatsApp transmission logs cleared.', 'info');
    } else if (deleteTarget.type === 'order') {
      const ord = deleteTarget.order;
      setOrders((prev) => prev.filter((o) => o.id !== ord.id && o.orderId !== ord.orderId));
      setWhatsappLogs((prev) => prev.filter((l) => l.orderId !== ord.orderId));
      showNotification(`Order ${ord.orderId} (${ord.customerName}) permanently removed.`, 'info');
    } else if (deleteTarget.type === 'log') {
      setWhatsappLogs((prev) => prev.filter((l) => l.id !== deleteTarget.logId));
      showNotification(`WhatsApp log entry for order ${deleteTarget.orderId} removed.`, 'info');
    }

    setDeleteTarget(null);
  };

  // Handler: Restore Sample Demo Data
  const handleRestoreDemoData = () => {
    restoreSampleData();
    setOrders(getStoredOrders());
    setWhatsappLogs(getStoredWhatsAppLogs());
    showNotification('Sample demo records restored!', 'success');
  };

  // Handler: Work Types & Samples Management
  const handleAddWorkType = (data: Omit<WorkTypeItem, 'id' | 'createdAt'>) => {
    const updated = addStoredWorkType(data);
    setWorkTypes(updated);
    showNotification(`New work type "${data.title}" added to catalog & order menu!`, 'success');
  };

  const handleUpdateWorkType = (data: WorkTypeItem) => {
    const updated = updateStoredWorkType(data);
    setWorkTypes(updated);
    showNotification(`Work type "${data.title}" specifications updated!`, 'success');
  };

  const handleDeleteWorkType = (id: string) => {
    const target = workTypes.find((w) => w.id === id);
    const updated = deleteStoredWorkType(id);
    setWorkTypes(updated);
    showNotification(`Work type "${target?.title || id}" removed from catalog.`, 'info');
  };

  const handleAddSample = (
    workTypeId: string,
    sample: Omit<WorkSample, 'id' | 'uploadedAt'>
  ) => {
    const updated = addSampleToWorkType(workTypeId, sample);
    setWorkTypes(updated);
    showNotification(`Proof sample "${sample.title}" added to portfolio!`, 'success');
  };

  const handleDeleteSample = (workTypeId: string, sampleId: string) => {
    const updated = deleteSampleFromWorkType(workTypeId, sampleId);
    setWorkTypes(updated);
    showNotification('Sample proof removed from portfolio.', 'info');
  };

  const handleSelectWorkTypeForOrder = (workTypeTitle: string) => {
    setPreselectedWorkTypeForOrder(workTypeTitle);
    setActiveTab('new_order');
    if (!currentUser) {
      handleOpenCustomerLogin('Creating Order');
    }
    showNotification(`Selected "${workTypeTitle}" for new order`, 'info');
  };

  // Handler: Export complete Excel workbook
  const handleExportExcel = () => {
    exportToExcelWorkbook(orders, whatsappLogs, apiSettings, shopProfile, designerProfiles, workTypes);
    showNotification('Exported complete ARYA SCREEN Excel workbook (.xlsx)!', 'success');
  };

  const cleanUserPhone = currentUser?.mobileNumber ? currentUser.mobileNumber.replace(/\D/g, '') : '';
  const customerOrders = cleanUserPhone
    ? orders.filter((o) => {
        const oMobile = o.mobileNumber.replace(/\D/g, '');
        const oWhatsapp = o.whatsappNumber.replace(/\D/g, '');
        return (
          oMobile === cleanUserPhone ||
          oWhatsapp === cleanUserPhone ||
          (cleanUserPhone.length >= 8 && oMobile.endsWith(cleanUserPhone)) ||
          (cleanUserPhone.length >= 8 && cleanUserPhone.endsWith(oMobile))
        );
      })
    : [];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Quick Notification Toast */}
      {quickNotification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3 ${
            quickNotification.type === 'error'
              ? 'bg-rose-900 text-rose-100 border-rose-700'
              : quickNotification.type === 'info'
              ? 'bg-blue-900 text-blue-100 border-blue-700'
              : 'bg-emerald-900 text-emerald-100 border-emerald-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{quickNotification.text}</span>
        </div>
      )}

      {/* Main Header & Ribbon */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shopProfile={shopProfile}
        apiSettings={apiSettings}
        onExportExcel={handleExportExcel}
        onOpenVbaModal={() => setIsVbaModalOpen(true)}
        onClearDatabase={() => setDeleteTarget({ type: 'all_database', count: orders.length })}
        totalOrdersCount={orders.length}
        customerOrdersCount={customerOrders.length}
        totalWorkTypesCount={workTypes.length}
        onOpenChangeLogo={() => setIsChangeLogoModalOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => handleOpenCustomerLogin()}
        onOpenCustomerLogin={() => handleOpenCustomerLogin('Creating Order')}
        onOpenAdminLogin={handleOpenAdminLogin}
        onLogout={handleLogout}
        onSwitchToCustomerView={handleSwitchToCustomerView}
      />

      {/* Main Work Area Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-16">
        {activeTab === 'dashboard' && (
          <Dashboard
            orders={orders}
            logs={whatsappLogs}
            setActiveTab={setActiveTab}
            onSelectOrderForReceipt={(order) => setReceiptOrder(order)}
            onQuickWhatsApp={handleQuickWhatsApp}
            onConfirmOrder={handleConfirmOrder}
          />
        )}

        {(activeTab === 'new_order' || activeTab === 'new_customer') && (
          <NewOrderForm
            orders={orders}
            apiSettings={apiSettings}
            shopProfile={shopProfile}
            designers={designers}
            workTypesList={workTypes}
            preselectedWorkType={preselectedWorkTypeForOrder}
            preselectedDeliveryDate={preselectedDeliveryDateForOrder}
            currentUser={currentUser}
            onRequestLogin={handleOpenCustomerLogin}
            onLoginSuccess={handleLoginSuccess}
            onAddDesigner={handleAddDesigner}
            onOrderCreated={(order, log) => {
              handleOrderCreated(order, log);
              setPreselectedDeliveryDateForOrder('');
            }}
            onOpenReceipt={(order) => setReceiptOrder(order)}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            orders={orders}
            designers={designers}
            onRescheduleOrder={handleRescheduleOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOpenReceipt={(order) => setReceiptOrder(order)}
            onQuickWhatsApp={handleQuickWhatsApp}
            onSelectDateForNewOrder={(dateStr) => {
              setPreselectedDeliveryDateForOrder(dateStr);
              setActiveTab('new_order');
            }}
          />
        )}

        {activeTab === 'customer_db' && (
          <CustomerDatabase
            orders={orders}
            onOpenReceipt={(order) => setReceiptOrder(order)}
            onDeleteOrder={(order) => setDeleteTarget({ type: 'order', order })}
          />
        )}

        {activeTab === 'designer_db' && (
          <DesignerDatabase
            designers={designerProfiles}
            orders={orders}
            onAddDesigner={handleAddDesignerProfile}
            onUpdateDesigner={handleUpdateDesignerProfile}
            onDeleteDesigner={handleDeleteDesignerProfile}
            onOpenReceipt={(order) => setReceiptOrder(order)}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {activeTab === 'work_types' && (
          <WorkTypesCatalog
            workTypes={workTypes}
            onAddWorkType={handleAddWorkType}
            onUpdateWorkType={handleUpdateWorkType}
            onDeleteWorkType={handleDeleteWorkType}
            onAddSample={handleAddSample}
            onDeleteSample={handleDeleteSample}
            onSelectForNewOrder={handleSelectWorkTypeForOrder}
            userRole={currentUser?.role || 'customer'}
          />
        )}

        {activeTab === 'customer_orders' && (
          <CustomerOrdersView
            currentUser={currentUser}
            orders={orders}
            shopProfile={shopProfile}
            onViewReceipt={(order) => setReceiptOrder(order)}
            onNavigateToSamples={() => setActiveTab('work_types')}
            onNavigateToNewOrder={() => {
              setActiveTab('new_order');
              if (!currentUser) {
                handleOpenCustomerLogin('Creating Order');
              }
            }}
            onRequestLogin={() => handleOpenCustomerLogin('Viewing Orders')}
          />
        )}

        {activeTab === 'work_orders' && (
          <WorkOrders
            orders={orders}
            designers={designers}
            onAddDesigner={handleAddDesigner}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateDesigner={handleUpdateDesigner}
            onOpenReceipt={(order) => setReceiptOrder(order)}
            onQuickWhatsApp={handleQuickWhatsApp}
            onDeleteOrder={(order) => setDeleteTarget({ type: 'order', order })}
            onSwitchToCalendar={() => setActiveTab('calendar')}
            onConfirmOrder={handleConfirmOrder}
          />
        )}

        {activeTab === 'search' && (
          <SearchSystem
            orders={orders}
            onOpenReceipt={(order) => setReceiptOrder(order)}
            onQuickWhatsApp={handleQuickWhatsApp}
            onDeleteOrder={(order) => setDeleteTarget({ type: 'order', order })}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsSheet
            orders={orders}
            onUpdatePayment={handleUpdatePayment}
            onOpenReceipt={(order) => setReceiptOrder(order)}
            onDeleteOrder={(order) => setDeleteTarget({ type: 'order', order })}
          />
        )}

        {activeTab === 'whatsapp_log' && (
          <WhatsAppLogSheet
            logs={whatsappLogs}
            orders={orders}
            apiSettings={apiSettings}
            onUpdateLog={handleUpdateWhatsAppLog}
            onDeleteLog={(logId, orderId) => setDeleteTarget({ type: 'log', logId, orderId })}
            onClearAllLogs={() => setDeleteTarget({ type: 'all_logs', count: whatsappLogs.length })}
          />
        )}

        {activeTab === 'settings' && (
          <ApiSettingsSheet
            apiSettings={apiSettings}
            shopProfile={shopProfile}
            orders={orders}
            whatsappLogsCount={whatsappLogs.length}
            designers={designers}
            onAddDesigner={handleAddDesigner}
            onRemoveDesigner={handleRemoveDesigner}
            onRestoreDefaultDesigners={handleRestoreDefaultDesigners}
            onSaveSettings={setApiSettings}
            onSaveProfile={setShopProfile}
            onTestWhatsApp={handleTestWhatsApp}
            onClearAllDatabase={() => setDeleteTarget({ type: 'all_database', count: orders.length })}
            onRestoreDemoData={handleRestoreDemoData}
          />
        )}
      </main>

      {/* Delete / Clear Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Printable Receipt Modal */}
      {receiptOrder && (
        <PrintableReceipt
          order={receiptOrder}
          shopProfile={shopProfile}
          onClose={() => setReceiptOrder(null)}
        />
      )}

      {/* WhatsApp Dispatch & Customization Modal */}
      <WhatsAppModal
        order={whatsAppModalOrder}
        apiSettings={apiSettings}
        isOpen={Boolean(whatsAppModalOrder)}
        onClose={() => {
          setWhatsAppModalOrder(null);
          setInitialWhatsAppMessageType(undefined);
        }}
        initialMessageType={initialWhatsAppMessageType}
        onLogUpdated={handleUpdateWhatsAppLog}
        onNavigateToSettings={() => {
          setWhatsAppModalOrder(null);
          setActiveTab('settings');
        }}
      />

      {/* Excel VBA / Office Scripts Modal */}
      <VbaModal
        isOpen={isVbaModalOpen}
        onClose={() => setIsVbaModalOpen(false)}
      />

      {/* Change Logo & Branding Modal */}
      <ChangeLogoModal
        isOpen={isChangeLogoModalOpen}
        onClose={() => setIsChangeLogoModalOpen(false)}
        shopProfile={shopProfile}
        onSave={(updated) => {
          setShopProfile(updated);
          showNotification('Shop logo and branding updated successfully!', 'success');
        }}
      />

      {/* Admin & Customer OTP Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
        orders={orders}
        initialRole={authModalRole}
        requiredForAction={authModalAction}
        apiSettings={apiSettings}
      />

      {/* Status Bar (Excel style footer) */}
      <footer className="no-print bg-slate-900 text-slate-400 text-xs px-4 py-2 border-t border-slate-800 font-mono-code flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-bold">READY</span>
          <span>•</span>
          <span>Workbook: ARYA SCREEN Database</span>
          <span>•</span>
          <span>Records: {orders.length}</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Shop: {shopProfile.shopName} ({shopProfile.phone1})</span>
          <span>•</span>
          <span>Meta WhatsApp Cloud API: {apiSettings.apiStatus}</span>
        </div>
      </footer>
    </div>
  );
}
