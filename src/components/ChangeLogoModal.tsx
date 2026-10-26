import React, { useState, useRef } from 'react';
import { ShopProfile } from '../types';
import { AryaLogo, LogoStyleId, AccentColorId } from './AryaLogo';
import {
  X,
  Upload,
  Image as ImageIcon,
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Save,
  Trash2,
} from 'lucide-react';

interface ChangeLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopProfile: ShopProfile;
  onSave: (updatedProfile: ShopProfile) => void;
}

const PRESET_STYLES: { id: LogoStyleId; name: string; desc: string }[] = [
  { id: 'arya2_3d', name: 'Arya 2 Vibrant 3D', desc: 'Glossy 3D typography with CMYK color splatters' },
  { id: 'squeegee', name: 'Modern Screen & Squeegee', desc: 'Silk screen frame with vibrant ink sweep' },
  { id: 'cmyk_matrix', name: 'CMYK Rosette Matrix', desc: 'Optical 4-color alignment registration' },
  { id: 'hex_shield', name: 'Industrial Hex Press', desc: 'Heavy-duty flex & rotary print badge' },
  { id: 'monogram', name: 'Architectural Monogram', desc: 'High-contrast typography lettermark' },
  { id: 'cylinders', name: 'Offset Press Rollers', desc: 'Roll-to-roll machinery cylinders & banner' },
  { id: 'royal_crest', name: 'Royal Heritage Crest', desc: 'Fine wedding cards & stationery seal' },
];

const ACCENT_COLORS: { id: AccentColorId; name: string; hex: string; bgClass: string }[] = [
  { id: 'emerald', name: 'Arya Emerald', hex: '#059669', bgClass: 'bg-emerald-600' },
  { id: 'blue', name: 'Sapphire Blue', hex: '#2563EB', bgClass: 'bg-blue-600' },
  { id: 'purple', name: 'Amethyst Purple', hex: '#9333EA', bgClass: 'bg-purple-600' },
  { id: 'red', name: 'Ruby Crimson', hex: '#E11D48', bgClass: 'bg-rose-600' },
  { id: 'amber', name: 'Sunset Amber', hex: '#D97706', bgClass: 'bg-amber-500' },
  { id: 'slate', name: 'Midnight Charcoal', hex: '#334155', bgClass: 'bg-slate-700' },
];

export const ChangeLogoModal: React.FC<ChangeLogoModalProps> = ({
  isOpen,
  onClose,
  shopProfile,
  onSave,
}) => {
  const [logoUrl, setLogoUrl] = useState(shopProfile.logoUrl || '');
  const [logoStyle, setLogoStyle] = useState<string>(shopProfile.logoStyle || 'squeegee');
  const [accentColor, setAccentColor] = useState<string>(shopProfile.accentColor || 'emerald');
  const [shopName, setShopName] = useState(shopProfile.shopName || 'ARYA SCREEN');
  const [tagline, setTagline] = useState(shopProfile.tagline || 'Flex • DTP • Printing • Designing');
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'brand'>('presets');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process file upload (drag & drop or input)
  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      setLogoUrl(base64);
      setActiveTab('upload');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleSave = () => {
    onSave({
      ...shopProfile,
      logoUrl,
      logoStyle,
      accentColor,
      shopName: shopName.trim() || 'ARYA SCREEN',
      tagline: tagline.trim() || 'Flex • DTP • Printing • Designing',
    });
    onClose();
  };

  const handleResetToDefault = () => {
    setLogoUrl('/arya2_logo.jpg');
    setLogoStyle('arya2_3d');
    setAccentColor('amber');
    setShopName('Arya 2');
    setTagline('Print Ideas • Create Possibilities • Flex & Print');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Change Top-Left Logo & Branding
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize your store emblem, color accents, and header appearance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Top-Left Header Simulation Banner */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="text-[10px] font-mono-code uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Live Header Preview (Top Left Display)</span>
            <span className="text-emerald-400 font-semibold">• Active Simulation</span>
          </div>

          <div className="p-3.5 bg-white rounded-xl shadow-inner border border-slate-200 flex items-center justify-between">
            <AryaLogo
              customLogoUrl={logoUrl}
              logoStyle={logoStyle}
              accentColor={accentColor}
              shopName={shopName}
              tagline={tagline}
              size="md"
              showSubtitle={true}
            />

            {logoUrl && (
              <button
                type="button"
                onClick={() => setLogoUrl('')}
                className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                title="Remove uploaded image and use vector logo"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Image</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'presets'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Designer Vector Logos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image File {logoUrl ? '✓' : ''}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('brand')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'brand'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Brand Colors & Name</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PRESET VECTOR STYLES */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Select Handcrafted Vector Logo
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Crisp SVG designs built specifically for printing, flex & DTP presses
                  </p>
                </div>
                {logoUrl && (
                  <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                    Custom image is active. Choosing a preset switches to vector emblem.
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_STYLES.map((preset) => {
                  const isSelected = !logoUrl && logoStyle === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setLogoUrl('');
                        setLogoStyle(preset.id);
                      }}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="shrink-0">
                        <AryaLogo
                          logoStyle={preset.id}
                          accentColor={accentColor}
                          size="sm"
                          showSubtitle={false}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {preset.name}
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {preset.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Accent Color Row */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Theme Accent Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {ACCENT_COLORS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setAccentColor(col.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        accentColor === col.id
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${col.bgClass}`} />
                      <span>{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD IMAGE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Upload Custom Logo File
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload an image from your computer to replace the default vector logo
                </p>
              </div>

              {/* Drag and drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-emerald-600 bg-emerald-50'
                    : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileProcess(file);
                  }}
                  className="hidden"
                />

                <div className="p-3 bg-white rounded-2xl shadow-xs border border-slate-200 text-emerald-700">
                  <Upload className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">
                    Click to browse or drag & drop image here
                  </p>
                  <p className="text-xs text-slate-500">
                    PNG, JPG, WebP, or SVG (Transparent background recommended)
                  </p>
                </div>

                <button
                  type="button"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-800 cursor-pointer pointer-events-none"
                >
                  Select File from Computer
                </button>
              </div>

              {/* Current file status */}
              {logoUrl ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="w-12 h-12 object-contain bg-white rounded-lg border border-emerald-200 p-1"
                    />
                    <div>
                      <div className="text-xs font-bold text-emerald-950">
                        Custom Logo Active
                      </div>
                      <div className="text-[11px] text-emerald-700">
                        Appears on top-left header, receipts, and invoices
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="px-3 py-1.5 bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>No custom file uploaded. Using vector preset emblem.</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BRANDING & TEXT */}
          {activeTab === 'brand' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Store Title & Service Tagline
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update the text displayed next to the logo on top-left
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Shop Name / Brand Name
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. ARYA SCREEN"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tagline / Key Services
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Flex • DTP • Printing • Designing"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Theme Accent Color Palette
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {ACCENT_COLORS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setAccentColor(col.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                        accentColor === col.id
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full ${col.bgClass} shrink-0`} />
                      <span className="text-xs font-bold text-slate-800 truncate">{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/70 transition-colors cursor-pointer"
            title="Reset to default Arya Screen branding"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Apply Logo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
