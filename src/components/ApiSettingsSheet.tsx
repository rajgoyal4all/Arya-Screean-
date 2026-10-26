import React, { useState } from 'react';
import { ApiSettings, ShopProfile, OrderItem } from '../types';
import {
  Settings,
  ShieldCheck,
  Key,
  Eye,
  EyeOff,
  Save,
  Send,
  Upload,
  Image,
  Code2,
  FileCode,
  Download,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  Zap,
  Database,
  Trash2,
  RefreshCw,
  Users,
  UserPlus,
  UserCheck,
  Link as LinkIcon,
} from 'lucide-react';
import { AryaLogo } from './AryaLogo';
import { ARYA_VBA_CODE, ARYA_OFFICE_SCRIPT, downloadTextFile } from '../utils/excelExporter';
import { DEFAULT_DESIGNERS } from '../utils/storage';
import {
  openWhatsAppDirectly,
  formatWhatsAppMessage,
  cleanPhoneNumber,
  hasLiveMetaCredentials,
  sendDirectCarrierSms,
} from '../utils/whatsapp';
import { Smartphone } from 'lucide-react';

interface ApiSettingsSheetProps {
  apiSettings: ApiSettings;
  shopProfile: ShopProfile;
  orders: OrderItem[];
  whatsappLogsCount: number;
  designers?: string[];
  onAddDesigner?: (name: string) => void;
  onRemoveDesigner?: (name: string) => void;
  onRestoreDefaultDesigners?: () => void;
  onSaveSettings: (settings: ApiSettings) => void;
  onSaveProfile: (profile: ShopProfile) => void;
  onTestWhatsApp: (targetPhone: string) => Promise<boolean>;
  onClearAllDatabase: () => void;
  onRestoreDemoData: () => void;
}

export const ApiSettingsSheet: React.FC<ApiSettingsSheetProps> = ({
  apiSettings,
  shopProfile,
  orders,
  whatsappLogsCount,
  designers = DEFAULT_DESIGNERS,
  onAddDesigner,
  onRemoveDesigner,
  onRestoreDefaultDesigners,
  onSaveSettings,
  onSaveProfile,
  onTestWhatsApp,
  onClearAllDatabase,
  onRestoreDemoData,
}) => {
  // Settings Form State
  const [phoneNumberId, setPhoneNumberId] = useState(apiSettings.phoneNumberId);
  const [accountId, setAccountId] = useState(apiSettings.accountId);
  const [accessToken, setAccessToken] = useState(apiSettings.accessToken);
  const [apiUrl, setApiUrl] = useState(apiSettings.apiUrl);
  const [templateName, setTemplateName] = useState(apiSettings.templateName);
  const [languageCode, setLanguageCode] = useState(apiSettings.languageCode);
  const [provider, setProvider] = useState(apiSettings.provider);
  const [enableAutoSend, setEnableAutoSend] = useState(apiSettings.enableAutoSend);
  const [showToken, setShowToken] = useState(false);

  // SMS Gateway State
  const [smsGatewayProvider, setSmsGatewayProvider] = useState<'None' | 'Fast2SMS (India)' | 'Twilio SMS' | 'Custom Webhook'>(
    apiSettings.smsGatewayProvider || 'None'
  );
  const [smsApiKey, setSmsApiKey] = useState(apiSettings.smsApiKey || '');
  const [smsSenderId, setSmsSenderId] = useState(apiSettings.smsSenderId || '');
  const [smsWebhookUrl, setSmsWebhookUrl] = useState(apiSettings.smsWebhookUrl || '');
  const [smsDirectAutoOpen, setSmsDirectAutoOpen] = useState(apiSettings.smsDirectAutoOpen ?? true);

  // Testing SMS
  const [testSmsMobile, setTestSmsMobile] = useState('9938109624');
  const [isTestingSms, setIsTestingSms] = useState(false);
  const [testSmsResult, setTestSmsResult] = useState<string | null>(null);

  // Shop Profile State
  const [shopName, setShopName] = useState(shopProfile.shopName);
  const [tagline, setTagline] = useState(shopProfile.tagline);
  const [address, setAddress] = useState(shopProfile.address);
  const [villageTown, setVillageTown] = useState(shopProfile.villageTown);
  const [district, setDistrict] = useState(shopProfile.district);
  const [pincode, setPincode] = useState(shopProfile.pincode);
  const [phone1, setPhone1] = useState(shopProfile.phone1);
  const [phone2, setPhone2] = useState(shopProfile.phone2);
  const [email, setEmail] = useState(shopProfile.email);
  const [gstNumber, setGstNumber] = useState(shopProfile.gstNumber);
  const [logoUrl, setLogoUrl] = useState(shopProfile.logoUrl);

  // Designer State
  const [newDesignerName, setNewDesignerName] = useState('');
  const [newDesignerRole, setNewDesignerRole] = useState('');
  const [designerError, setDesignerError] = useState<string | null>(null);

  // Testing WhatsApp
  const [testMobile, setTestMobile] = useState('9837012345');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Active sub-tab
  const [subTab, setSubTab] = useState<'api' | 'sms' | 'branding' | 'designers' | 'vba_scripts' | 'database'>('api');

  // Handle Logo Upload from local machine
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setLogoUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveApiSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ApiSettings = {
      ...apiSettings,
      phoneNumberId: phoneNumberId.trim(),
      accountId: accountId.trim(),
      accessToken: accessToken.trim(),
      apiUrl: apiUrl.trim(),
      templateName: templateName.trim(),
      languageCode: languageCode.trim(),
      provider,
      enableAutoSend,
      smsGatewayProvider,
      smsApiKey: smsApiKey.trim(),
      smsSenderId: smsSenderId.trim(),
      smsWebhookUrl: smsWebhookUrl.trim(),
      smsDirectAutoOpen,
      apiStatus:
        accessToken && !accessToken.includes('Replace') ? 'Connected' : 'Test Mode',
      lastMessageStatus: 'Settings updated successfully by administrator',
    };
    onSaveSettings(updated);
    alert('API Settings & SMS Gateway saved successfully!');
  };

  const runTestCarrierSms = async () => {
    setIsTestingSms(true);
    setTestSmsResult(null);
    try {
      const res = await sendDirectCarrierSms(
        testSmsMobile,
        `arya2 test OTP: 4829. Admin Pramod Sagria (9938109624).`,
        {
          ...apiSettings,
          smsGatewayProvider,
          smsApiKey,
          smsWebhookUrl,
        }
      );
      if (res.success) {
        setTestSmsResult(`✅ Success (${res.provider}): ${res.details}`);
      } else {
        setTestSmsResult(`⚠️ Notice (${res.provider}): ${res.details}`);
      }
    } catch (e: any) {
      setTestSmsResult(`❌ Error: ${e?.message || 'Failed to dispatch test SMS'}`);
    } finally {
      setIsTestingSms(false);
    }
  };

  const handleSaveShopProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ShopProfile = {
      shopName: shopName.trim(),
      tagline: tagline.trim(),
      address: address.trim(),
      villageTown: villageTown.trim(),
      district: district.trim(),
      pincode: pincode.trim(),
      phone1: phone1.trim(),
      phone2: phone2.trim(),
      email: email.trim(),
      gstNumber: gstNumber.trim(),
      logoUrl: logoUrl.trim(),
    };
    onSaveProfile(updated);
    alert('Arya Screen branding & shop profile updated successfully!');
  };

  const runTestConnection = async () => {
    if (!testMobile.trim()) {
      alert('Please enter a test 10-digit mobile number.');
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    try {
      const success = await onTestWhatsApp(testMobile);
      if (success) {
        setTestResult('Success: Test message transmitted. Check WhatsApp Log sheet.');
      } else {
        setTestResult('Notice: Dispatched in Test / Direct Web fallback mode.');
      }
    } catch (err: any) {
      setTestResult(`Error: ${err?.message || 'Connection failed'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 text-emerald-400 rounded-xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              API SETTINGS & ARYA SCREEN CONFIGURATION
            </h1>
            <p className="text-xs text-slate-500">
              Protected credentials for WhatsApp Cloud API, store branding, logo replacement, and Excel VBA automation macros
            </p>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-wrap">
          <button
            onClick={() => setSubTab('api')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'api'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            WhatsApp API
          </button>
          <button
            onClick={() => setSubTab('sms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'sms'
                ? 'bg-emerald-700 text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>SMS &amp; OTP Gateway</span>
          </button>
          <button
            onClick={() => setSubTab('branding')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'branding'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Arya Logo &amp; Shop Info
          </button>
          <button
            onClick={() => setSubTab('designers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'designers'
                ? 'bg-white text-purple-800 shadow-xs border border-purple-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-purple-600" />
            <span>Designers & Staff ({designers.length})</span>
          </button>
          <button
            onClick={() => setSubTab('vba_scripts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'vba_scripts'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Excel VBA / Scripts
          </button>
          <button
            onClick={() => setSubTab('database')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'database'
                ? 'bg-rose-50 text-rose-700 shadow-xs border border-rose-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database Reset</span>
          </button>
        </div>
      </div>

      {/* TAB 1: WhatsApp Business Cloud API Settings */}
      {subTab === 'api' && (
        <div className="space-y-6">
          {/* Diagnostic & Mode Explanation Card */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl p-5 border border-emerald-200 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <h3 className="font-bold text-slate-900 text-sm">
                  How WhatsApp Sending Works in Arya Screen
                </h3>
                <p className="leading-relaxed">
                  <strong>1. Direct WhatsApp Web / Mobile (Recommended & Free):</strong> Works instantly without any API token, Meta developer approval, or credit card. It pre-fills the customer's phone number and the exact Arya Screen message in WhatsApp Web or the WhatsApp phone app with one click.
                </p>
                <p className="leading-relaxed">
                  <strong>2. Meta WhatsApp Business Cloud API (Background Automated):</strong> Requires a registered Meta Developer Account, WhatsApp Business Account ID (WABA), Permanent System User Token, and Phone Number ID from Meta.
                </p>
                <div className="pt-1 flex items-center gap-2 font-semibold text-emerald-800">
                  <span>Current API Status:</span>
                  <span className="font-mono-code px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300">
                    {hasLiveMetaCredentials(apiSettings) ? 'Live Meta Credentials Configured' : 'Direct WhatsApp Mode Active (Default)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveApiSettings} className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    Official WhatsApp Business Cloud API Credentials
                  </h2>
                </div>
                <span className="text-xs text-slate-500">
                  Secured & Protected (Not exposed on customer form)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone Number ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    WhatsApp Business Phone Number ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    placeholder="e.g. 109847291839210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm font-mono-code outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Found in Meta for Developers &gt; WhatsApp &gt; API Setup
                  </span>
                </div>

                {/* Account ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    WhatsApp Business Account ID (WABA) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    placeholder="e.g. 192847109283741"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm font-mono-code outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Meta WhatsApp Business Account Identifier
                  </span>
                </div>

                {/* Access Token */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Permanent System User Access Token <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showToken ? 'Hide Token' : 'Show Token'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showToken ? 'text' : 'password'}
                      required
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="EAAGm0PX4ZCpsBAK..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm font-mono-code outline-none"
                    />
                  </div>
                </div>

                {/* API URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    API Endpoint Base URL
                  </label>
                  <input
                    type="url"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://graph.facebook.com/v21.0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono-code outline-none"
                  />
                </div>

                {/* Provider Mode */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Integration Provider Mode
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold outline-none bg-white"
                  >
                    <option value="Meta WhatsApp Cloud API">Meta WhatsApp Cloud API (Recommended)</option>
                    <option value="Simulator / Direct Web">Simulator / Direct WhatsApp Web Fallback</option>
                    <option value="Twilio">Twilio WhatsApp API</option>
                    <option value="Gupshup">Gupshup Enterprise</option>
                  </select>
                </div>

                {/* Template Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Message Template Name
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="arya_screen_order_confirmation"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono-code outline-none"
                  />
                </div>

                {/* Language Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Language Code
                  </label>
                  <input
                    type="text"
                    value={languageCode}
                    onChange={(e) => setLanguageCode(e.target.value)}
                    placeholder="en_US or hi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono-code outline-none"
                  />
                </div>
              </div>

              {/* Save API Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Status:{' '}
                  <span className="font-semibold text-emerald-700 font-mono-code">
                    {apiSettings.apiStatus}
                  </span>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save API Settings</span>
                </button>
              </div>
            </div>
          </form>

          {/* Test WhatsApp Message Dispatch Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <Send className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-bold text-slate-900">
                Test WhatsApp API Transmission
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Enter any 10-digit mobile number to verify message formatting and API dispatch.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono-code">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={testMobile}
                  onChange={(e) => setTestMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="9837012345"
                  className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono-code outline-none font-medium"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (!testMobile.trim()) {
                      alert('Please enter a 10-digit mobile number.');
                      return;
                    }
                    const dummyMsg = `*ARYA SCREEN Test Notice*\n\nHello! This is a test confirmation from Arya Screen (Flex • DTP • Printing • Designing).\n\nIf you received this message, WhatsApp dispatch is working perfectly!`;
                    openWhatsAppDirectly(testMobile, dummyMsg);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open WhatsApp Web/App</span>
                </button>

                <button
                  type="button"
                  onClick={runTestConnection}
                  disabled={isTesting}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                  title="Test Meta Cloud API HTTP endpoint"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isTesting ? 'Testing API...' : 'Test Cloud API'}</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono-code text-slate-800">
                {testResult}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 1b: Cellular SMS & Real OTP Gateway Configuration */}
      {subTab === 'sms' && (
        <form onSubmit={handleSaveApiSettings} className="space-y-6">
          {/* Explanation Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white border-2 border-emerald-500/80 shadow-xl space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/40">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Direct Mobile Cellular SMS &amp; OTP Delivery Setup
                </h3>
                <p className="text-xs text-emerald-300/80">
                  Deliver OTP codes directly into customer and admin mobile SMS inboxes
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-900/40 rounded-xl border border-emerald-500/30 text-xs text-emerald-100 leading-relaxed space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Why did OTP not arrive directly to mobile earlier?</span>
              </div>
              <p>
                Pure browser-based applications cannot deliver telecom cellular SMS without an Indian SMS Gateway API. Without a gateway configured, the app uses WhatsApp Web and instant on-screen verification. By configuring Fast2SMS or a Webhook below, real SMS messages will land directly into users' mobile phone SMS inboxes!
              </p>
            </div>
          </div>

          {/* SMS Gateway Settings Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Telecom Carrier SMS Gateway Configuration
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                Direct SMS Delivery to Indian Mobile Numbers (+91)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  SMS Gateway Provider
                </label>
                <select
                  value={smsGatewayProvider}
                  onChange={(e) => setSmsGatewayProvider(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-xs font-bold outline-none bg-white cursor-pointer"
                >
                  <option value="None">None (Use WhatsApp &amp; 1-Click Instant Login)</option>
                  <option value="Fast2SMS (India)">Fast2SMS (India - Direct Cellular SMS)</option>
                  <option value="Custom Webhook">Custom Webhook (External SMS API)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Fast2SMS delivers carrier SMS to any 10-digit mobile number in India instantly.
                </p>
              </div>

              {smsGatewayProvider === 'Fast2SMS (India)' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Fast2SMS Authorization API Key
                  </label>
                  <input
                    type="password"
                    value={smsApiKey}
                    onChange={(e) => setSmsApiKey(e.target.value)}
                    placeholder="Enter your Fast2SMS API Key"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-xs font-mono-code font-bold outline-none"
                  />
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Get free key at fast2sms.com</span>
                    <a
                      href="https://www.fast2sms.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Open Fast2SMS →
                    </a>
                  </div>
                </div>
              )}

              {smsGatewayProvider === 'Custom Webhook' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Custom Webhook URL (HTTP POST)
                  </label>
                  <input
                    type="url"
                    value={smsWebhookUrl}
                    onChange={(e) => setSmsWebhookUrl(e.target.value)}
                    placeholder="https://api.mysmsprovider.com/send"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-xs font-mono-code outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Payload sent: &#123; to: "9837012345", message: "Your OTP is 1234" &#125;
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={smsDirectAutoOpen}
                  onChange={(e) => setSmsDirectAutoOpen(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Auto-open WhatsApp/SMS app when OTP is requested</span>
              </label>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save SMS Gateway Settings</span>
              </button>
            </div>
          </div>

          {/* Test Cellular SMS Dispatch Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Send Test Direct Mobile SMS
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono-code">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={testSmsMobile}
                  onChange={(e) => setTestSmsMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="9938109624"
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-mono-code font-bold outline-none"
                />
              </div>

              <button
                type="button"
                onClick={runTestCarrierSms}
                disabled={isTestingSms || testSmsMobile.length < 10}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isTestingSms ? 'Dispatching...' : 'Dispatch Test SMS to Mobile'}</span>
              </button>
            </div>

            {testSmsResult && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono-code text-slate-800">
                {testSmsResult}
              </div>
            )}
          </div>
        </form>
      )}

      {/* TAB 2: Arya Logo & Shop Branding */}
      {subTab === 'branding' && (
        <form onSubmit={handleSaveShopProfile} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Arya Screen Logo & Brand Information
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                Appears on Form, Printable Receipts & WhatsApp Notices
              </span>
            </div>

            {/* Logo Preview & Custom Upload / URL Linking */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Shop Logo (Optional URL or File Upload)
                  </label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Link an image URL or upload an image file (PNG, JPG, SVG, WebP) to display dynamically in the application header and receipts.
                  </p>
                </div>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 border border-rose-200 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Logo</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                {/* Dynamic Preview Box */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3 shrink-0">
                  <AryaLogo
                    customLogoUrl={logoUrl}
                    logoStyle={shopProfile.logoStyle}
                    accentColor={shopProfile.accentColor}
                    shopName={shopName || 'ARYA SCREEN'}
                    tagline={tagline}
                    size="md"
                    showSubtitle={true}
                  />
                </div>

                {/* Input Controls */}
                <div className="flex-1 w-full space-y-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Logo URL (Optional)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png or paste image link / data URL"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono-code text-slate-800 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none bg-white"
                      />
                    </div>

                    <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs shrink-0 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    Tip: Enter an external image web address or browse to upload an image directly. If left blank, the modern vector emblem will be used.
                  </span>
                </div>
              </div>
            </div>

            {/* Shop Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tagline / Services
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  GST Registration Number
                </label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="09AAWPA1234B1Z2"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono-code text-sm outline-none"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Shop / Workshop Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Village / Town
                </label>
                <input
                  type="text"
                  value={villageTown}
                  onChange={(e) => setVillageTown(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pincode
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono-code text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Mobile / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone1}
                  onChange={(e) => setPhone1(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono-code text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Secondary Phone
                </label>
                <input
                  type="text"
                  value={phone2}
                  onChange={(e) => setPhone2(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono-code text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Arya Screen Profile</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB: Designers & Staff Management */}
      {subTab === 'designers' && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Team Members
              </span>
              <div className="mt-2 text-3xl font-black text-slate-900 font-mono-code">
                {designers.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Active in dropdowns & work orders
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Active Job Assignments
              </span>
              <div className="mt-2 text-3xl font-black text-purple-700 font-mono-code">
                {orders.filter((o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Live in-progress work orders
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Team Roles
              </span>
              <div className="mt-2 text-2xl font-black text-emerald-700 font-mono-code">
                Flex • DTP • Print
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Synchronized across forms & sheets
              </p>
            </div>
          </div>

          {/* Add New Designer Form Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Add New Designer / Operator
                  </h2>
                  <p className="text-xs text-slate-500">
                    Register a new staff member to assign flex, DTP, and printing orders
                  </p>
                </div>
              </div>

              {onRestoreDefaultDesigners && (
                <button
                  type="button"
                  onClick={onRestoreDefaultDesigners}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer"
                  title="Reset team to Arya Screen standard operators"
                >
                  Reset to Default Team
                </button>
              )}
            </div>

            {designerError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {designerError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const name = newDesignerName.trim();
                if (!name) {
                  setDesignerError('Please enter a designer name');
                  return;
                }
                const role = newDesignerRole.trim();
                const fullName = role ? `${name} (${role})` : name;
                if (designers.some((d) => d.toLowerCase() === fullName.toLowerCase())) {
                  setDesignerError('This designer name is already in the list');
                  return;
                }
                if (onAddDesigner) {
                  onAddDesigner(fullName);
                }
                setNewDesignerName('');
                setNewDesignerRole('');
                setDesignerError(null);
              }}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end"
            >
              <div className="sm:col-span-5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Designer / Operator Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newDesignerName}
                  onChange={(e) => {
                    setNewDesignerName(e.target.value);
                    setDesignerError(null);
                  }}
                  placeholder="e.g. Arun Kumar or Pooja Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm font-semibold outline-none bg-white"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Role / Specialization <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={newDesignerRole}
                  onChange={(e) => setNewDesignerRole(e.target.value)}
                  placeholder="e.g. Flex Master, DTP & Cards"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none bg-white"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer h-[42px]"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Designer</span>
                </button>
              </div>
            </form>

            {/* Quick role suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-400 font-semibold">Quick Suggestions:</span>
              {['Flex Master', 'DTP & Graphics', 'Wedding Cards & Design', 'Offset & Screen', 'Finishing & Lamination'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setNewDesignerRole(r)}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors font-medium"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Current Roster Grid */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <span>Registered Designers & Production Team ({designers.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {designers.map((designer) => {
                const assignedCount = orders.filter((o) => o.designerOperator === designer).length;
                const activeCount = orders.filter(
                  (o) => o.designerOperator === designer && o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'
                ).length;

                return (
                  <div
                    key={designer}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {designer.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 text-xs truncate" title={designer}>
                          {designer}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{activeCount} active job{activeCount === 1 ? '' : 's'}</span>
                          <span>•</span>
                          <span>{assignedCount} total</span>
                        </div>
                      </div>
                    </div>

                    {onRemoveDesigner && (
                      <button
                        type="button"
                        onClick={() => {
                          if (assignedCount > 0) {
                            if (!window.confirm(`"${designer}" is currently assigned to ${assignedCount} order(s). Do you still want to remove them from the list?`)) {
                              return;
                            }
                          }
                          onRemoveDesigner(designer);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors shrink-0"
                        title={`Remove ${designer}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Excel VBA / Office Scripts Generator */}
      {subTab === 'vba_scripts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Excel VBA Macros & Microsoft Office Scripts
                  </h2>
                  <p className="text-xs text-slate-500">
                    Ready-to-use automation code for Excel Desktop (Windows/Mac) & Excel for the Web (Power Automate)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadTextFile('AryaScreen_Automation.bas', ARYA_VBA_CODE)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .BAS Macro Module</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-slate-700 font-medium">
                <strong>How to import in Microsoft Excel:</strong>
                <ol className="list-decimal pl-5 mt-1 space-y-1 text-slate-600">
                  <li>In Excel, press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border">ALT + F11</kbd> to open the VBA Editor.</li>
                  <li>Click <strong>File &gt; Import File...</strong> and select <code>AryaScreen_Automation.bas</code> (or insert a new Module and paste the code below).</li>
                  <li>Save your workbook as <strong>Excel Macro-Enabled Workbook (*.xlsm)</strong>.</li>
                </ol>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-emerald-300 rounded-xl font-mono-code text-[11px] max-h-96 overflow-y-auto overflow-x-auto whitespace-pre leading-relaxed">
                  {ARYA_VBA_CODE}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Database Maintenance & Wipe */}
      {subTab === 'database' && (
        <div className="space-y-6">
          {/* Database Status Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Orders & Customers
              </span>
              <div className="mt-2 text-2xl font-black text-slate-900 font-mono-code">
                {orders.length} Records
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Active entries stored in Customer Database & Work Orders
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                WhatsApp Delivery Logs
              </span>
              <div className="mt-2 text-2xl font-black text-slate-900 font-mono-code">
                {whatsappLogsCount} Entries
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Audited message transmission history
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Storage Architecture
              </span>
              <div className="mt-2 text-2xl font-black text-emerald-700 font-mono-code">
                Active & Persistent
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Excel Local Database Engine v2
              </p>
            </div>
          </div>

          {/* Database Action Cards */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" />
                <span>Clear Entire Database</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Remove all customer profiles, work orders, payment transactions, and WhatsApp logs to start completely fresh.
              </p>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-rose-800 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                Permanent Wipe Notice
              </p>
              <p className="leading-relaxed">
                Clearing the database will permanently delete all {orders.length} order records and {whatsappLogsCount} WhatsApp message logs. 
                Your Shop Profile (Arya Screen branding, phone numbers, GST) and Meta API credentials will remain securely saved.
                The next order you create will start cleanly from <strong>ARYA-2026-0001</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={onClearAllDatabase}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>🚨 Clear All Database (Reset to Empty)</span>
              </button>

              <button
                type="button"
                onClick={onRestoreDemoData}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                title="Populate 6 sample flex/printing orders for testing"
              >
                <RefreshCw className="w-4 h-4 text-slate-600" />
                <span>Restore Sample Demo Records</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
