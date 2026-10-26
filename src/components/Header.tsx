import React from 'react';
import { ActiveTab, ShopProfile, ApiSettings, AuthUser } from '../types';
import { AryaLogo } from './AryaLogo';
import {
  LayoutDashboard,
  UserPlus,
  Search,
  ClipboardList,
  IndianRupee,
  MessageSquareShare,
  Settings,
  Download,
  Code2,
  Database,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Pencil,
  Palette,
  Layers,
  Calendar,
  Crown,
  User,
  LogIn,
  Eye,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  shopProfile: ShopProfile;
  apiSettings: ApiSettings;
  onExportExcel: () => void;
  onOpenVbaModal: () => void;
  onClearDatabase: () => void;
  totalOrdersCount: number;
  customerOrdersCount?: number;
  totalWorkTypesCount?: number;
  onOpenChangeLogo?: () => void;
  currentUser: AuthUser | null;
  onOpenAuthModal: () => void;
  onOpenCustomerLogin?: () => void;
  onOpenAdminLogin?: () => void;
  onLogout: () => void;
  onSwitchToCustomerView?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  shopProfile,
  apiSettings,
  onExportExcel,
  onOpenVbaModal,
  onClearDatabase,
  totalOrdersCount,
  customerOrdersCount = 0,
  totalWorkTypesCount = 8,
  onOpenChangeLogo,
  currentUser,
  onOpenAuthModal,
  onOpenCustomerLogin,
  onOpenAdminLogin,
  onLogout,
  onSwitchToCustomerView,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const isCustomer = currentUser?.role === 'customer';

  // Admin tabs (Full software operation)
  const adminTabs = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'new_order' as ActiveTab, label: 'New Order / Customer', icon: UserPlus, badge: 'Quick' },
    { id: 'work_orders' as ActiveTab, label: 'Work Orders', icon: ClipboardList, badge: totalOrdersCount },
    { id: 'calendar' as ActiveTab, label: 'Calendar View', icon: Calendar, badge: 'Monthly' },
    { id: 'work_types' as ActiveTab, label: 'Work Types & Samples', icon: Layers, badge: `${totalWorkTypesCount}` },
    { id: 'customer_db' as ActiveTab, label: 'Customer Database', icon: Database, badge: null },
    { id: 'designer_db' as ActiveTab, label: 'Designer Database', icon: Palette, badge: 'Roster' },
    { id: 'search' as ActiveTab, label: 'Search System', icon: Search, badge: null },
    { id: 'payments' as ActiveTab, label: 'Payments', icon: IndianRupee, badge: null },
    { id: 'whatsapp_log' as ActiveTab, label: 'WhatsApp Log', icon: MessageSquareShare, badge: null },
    { id: 'settings' as ActiveTab, label: 'API & Settings', icon: Settings, badge: null },
  ];

  // Customer / Visitor tabs (strictly Design Samples & Orders)
  const customerTabs = [
    { id: 'work_types' as ActiveTab, label: 'Design Samples & Catalog', icon: Layers, badge: `${totalWorkTypesCount}` },
    { id: 'customer_orders' as ActiveTab, label: 'My Orders & Tracking', icon: ClipboardList, badge: isCustomer ? customerOrdersCount : null },
    { id: 'new_order' as ActiveTab, label: '+ Place New Order', icon: UserPlus, badge: 'Requires Login' },
  ];

  const tabs = isAdmin ? adminTabs : customerTabs;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner / Excel Workbook & Auth Bar */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs font-mono-code border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-600/30 text-emerald-400 px-2 py-0.5 rounded font-semibold text-[11px] border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              EXCEL ENTERPRISE WORKBOOK
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-emerald-600/30 text-emerald-400 px-2 py-0.5 rounded font-semibold text-[11px] border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              CUSTOMER PORTAL
            </span>
          )}
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-300 font-medium">
            {shopProfile.shopName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_SYSTEM_2026.xlsm
          </span>
        </div>

        {/* User Role Badge & Auth Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin ? (
            <>
              <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 rounded text-[11px] text-amber-300">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold">Admin: Pramod Sagria (9938109624)</span>
                <span className="bg-amber-400/20 text-amber-200 px-1.5 py-0.2 rounded text-[10px] font-bold">
                  Full Control
                </span>
              </div>

              {onSwitchToCustomerView && (
                <button
                  onClick={onSwitchToCustomerView}
                  className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded transition-colors cursor-pointer"
                  title="Preview Customer View"
                >
                  <Eye className="w-3 h-3 text-emerald-400" />
                  <span className="hidden md:inline">Customer Preview</span>
                </button>
              )}

              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-[11px] font-bold text-rose-300 hover:text-rose-200 bg-rose-950/60 hover:bg-rose-900 px-2 py-0.5 rounded transition-colors cursor-pointer"
                title="Logout of Admin Panel"
              >
                <span>Logout</span>
              </button>
            </>
          ) : isCustomer ? (
            <>
              <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 rounded text-[11px] text-emerald-300">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold">
                  Customer: {currentUser?.name || `+91 ${currentUser?.mobileNumber}`}
                </span>
                <span className="bg-emerald-400/20 text-emerald-200 px-1.5 py-0.2 rounded text-[10px] font-bold">
                  Verified
                </span>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded transition-colors cursor-pointer"
                title="Logout"
              >
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onOpenCustomerLogin || onOpenAuthModal}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/50 px-2.5 py-0.5 rounded transition-colors cursor-pointer"
                title="Login with Customer Mobile Number & OTP"
              >
                <User className="w-3 h-3 text-emerald-400" />
                <span>Customer Login (OTP)</span>
              </button>

              <button
                onClick={onOpenAdminLogin || onOpenAuthModal}
                className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-950/80 hover:bg-amber-900 border border-amber-700/50 px-2.5 py-0.5 rounded transition-colors cursor-pointer"
                title="Admin Login for Pramod Sagria (9938109624)"
              >
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Admin Portal</span>
              </button>
            </>
          )}

          {isAdmin && (
            <button
              onClick={onOpenVbaModal}
              className="hidden lg:flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="View & Download Excel VBA / Office Scripts Code"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">VBA</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Brand & Action Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center justify-between">
          <div
            onClick={isAdmin ? onOpenChangeLogo : undefined}
            role={isAdmin && onOpenChangeLogo ? 'button' : undefined}
            tabIndex={isAdmin && onOpenChangeLogo ? 0 : undefined}
            onKeyDown={(e) => {
              if (isAdmin && onOpenChangeLogo && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onOpenChangeLogo();
              }
            }}
            className={`group relative flex items-center rounded-xl transition-all ${
              isAdmin && onOpenChangeLogo
                ? 'cursor-pointer hover:bg-slate-50 p-1.5 -m-1.5'
                : ''
            }`}
            title={isAdmin ? 'Click to change logo & branding' : 'arya2 Print & Flex'}
          >
            <AryaLogo
              customLogoUrl={shopProfile.logoUrl}
              logoStyle={shopProfile.logoStyle}
              accentColor={shopProfile.accentColor}
              shopName={shopProfile.shopName}
              tagline={shopProfile.tagline}
              size="md"
              showSubtitle={true}
            />

            {isAdmin && onOpenChangeLogo && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 group-hover:text-emerald-700 bg-slate-100 group-hover:bg-emerald-50 px-2 py-0.5 rounded-md border border-transparent group-hover:border-emerald-200 ml-2 transition-all opacity-70 group-hover:opacity-100">
                <Pencil className="w-2.5 h-2.5" />
                <span>Change Logo</span>
              </span>
            )}
          </div>
        </div>

        {/* Global Toolbar / Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {isAdmin ? (
            <>
              <button
                id="header-export-excel-btn"
                onClick={onExportExcel}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Excel (.xlsx)</span>
              </button>

              <button
                id="header-clear-db-btn"
                onClick={onClearDatabase}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                title="Clear all database records"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Clear Database</span>
              </button>

              <button
                id="header-new-order-quick-btn"
                onClick={() => setActiveTab('new_order')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>+ New Order</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('work_types')}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Design Samples</span>
              </button>

              <button
                onClick={() => setActiveTab('customer_orders')}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                <ClipboardList className="w-4 h-4 text-emerald-700" />
                <span>My Orders ({customerOrdersCount})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('new_order');
                  if (!currentUser && onOpenCustomerLogin) {
                    onOpenCustomerLogin();
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-bold shadow-sm transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Place Order</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="border-t border-slate-200 bg-slate-50/80 px-4 sm:px-6 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all relative border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-emerald-600' : 'text-slate-500'
                  }`}
                />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
