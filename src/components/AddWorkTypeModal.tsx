import React, { useState } from 'react';
import { WorkTypeItem, WorkSample } from '../types';
import { WORK_TYPE_CATEGORIES } from '../utils/defaultWorkTypes';
import { generateDynamicSampleSvg } from '../utils/sampleArtworks';
import {
  X,
  Layers,
  Sparkles,
  Globe,
  IndianRupee,
  Clock,
  Maximize2,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Loader2,
} from 'lucide-react';

interface AddWorkTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workTypeData: Omit<WorkTypeItem, 'id' | 'createdAt'>) => void;
  existingWorkType?: WorkTypeItem | null;
}

export const AddWorkTypeModal: React.FC<AddWorkTypeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingWorkType,
}) => {
  const isEditing = Boolean(existingWorkType);

  const [title, setTitle] = useState(existingWorkType?.title || '');
  const [category, setCategory] = useState(
    existingWorkType?.category || 'Outdoor Signage'
  );
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState(
    existingWorkType?.description || ''
  );
  const [unit, setUnit] = useState(existingWorkType?.unit || 'sq.ft');
  const [basePrice, setBasePrice] = useState<number | string>(
    existingWorkType?.basePrice || 15
  );
  const [minQuantity, setMinQuantity] = useState<number | string>(
    existingWorkType?.minQuantity || 1
  );
  const [defaultDimensions, setDefaultDimensions] = useState(
    existingWorkType?.defaultDimensions || '10x3 ft'
  );
  const [materialsText, setMaterialsText] = useState(
    existingWorkType?.materialOptions?.join(', ') ||
      'Standard Quality Media, Premium Coating'
  );
  const [estimatedTurnaround, setEstimatedTurnaround] = useState(
    existingWorkType?.estimatedTurnaround || 'Same Day (2-4 hrs)'
  );
  const [isPopular, setIsPopular] = useState(
    existingWorkType?.isPopular ?? true
  );
  const [notes, setNotes] = useState(existingWorkType?.notes || '');

  // Initial Sample Option
  const [includeInitialSample, setIncludeInitialSample] = useState(!isEditing);
  const [sampleClientName, setSampleClientName] = useState('Standard Studio Mockup');

  // Search Grounding AI State
  const [isSearching, setIsSearching] = useState(false);
  const [searchGroundingSources, setSearchGroundingSources] = useState<
    { title: string; url: string }[]
  >([]);
  const [marketInsights, setMarketInsights] = useState('');
  const [apiError, setApiError] = useState('');

  if (!isOpen) return null;

  // Real-time market research using Google Search Grounding (gemini-3.8-flash)
  const handleMarketResearch = async () => {
    if (!title.trim()) {
      setApiError('Please enter a work type name first (e.g. "UV Acrylic Sign" or "Die-Cut Vinyl Sticker")');
      return;
    }

    setApiError('');
    setIsSearching(true);
    setSearchGroundingSources([]);
    setMarketInsights('');

    try {
      const response = await fetch('/api/research-worktype', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workTypeName: title.trim() }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to research specifications');
      }

      const data = result.data;
      if (data) {
        if (data.category) setCategory(data.category);
        if (data.unit) setUnit(data.unit);
        if (typeof data.basePrice === 'number' && data.basePrice > 0) {
          setBasePrice(data.basePrice);
        }
        if (data.defaultDimensions) setDefaultDimensions(data.defaultDimensions);
        if (data.estimatedTurnaround) setEstimatedTurnaround(data.estimatedTurnaround);
        if (Array.isArray(data.materialOptions) && data.materialOptions.length > 0) {
          setMaterialsText(data.materialOptions.join(', '));
        }
        if (data.description && !description) {
          setDescription(data.description);
        }
        if (data.marketInsights) {
          setMarketInsights(data.marketInsights);
        }
      }

      if (result.grounding?.sources) {
        setSearchGroundingSources(result.grounding.sources);
      }
    } catch (err: any) {
      console.warn('Search grounding fetch error, providing local intelligent defaults:', err);
      setApiError(
        err.message || 'Could not connect to Google Search Grounding. Applied commercial standard defaults.'
      );
      // Sensible standard defaults based on title keywords
      const lower = title.toLowerCase();
      if (lower.includes('flex') || lower.includes('banner')) {
        setCategory('Outdoor Signage');
        setUnit('sq.ft');
        setBasePrice(12);
        setDefaultDimensions('10x3 ft');
        setMaterialsText('Star Frontlit Flex 280 GSM, Star Backlit 340 GSM');
      } else if (lower.includes('card') || lower.includes('visiting')) {
        setCategory('Cards & Stationery');
        setUnit('per 1000 pcs');
        setBasePrice(450);
        setDefaultDimensions('3.5x2 in');
        setMaterialsText('350 GSM Velvet Matte, Thermal Gloss Lamination');
      } else if (lower.includes('acrylic') || lower.includes('glow') || lower.includes('neon')) {
        setCategory('Outdoor Signage');
        setUnit('sq.ft');
        setBasePrice(140);
        setDefaultDimensions('8x3 ft');
        setMaterialsText('3mm Cast Acrylic, Samsung LED Modules, Aluminum Framing');
      } else if (lower.includes('book') || lower.includes('bill') || lower.includes('invoice')) {
        setCategory('DTP & Office Stationery');
        setUnit('per book');
        setBasePrice(180);
        setDefaultDimensions('8.5x5.5 in');
        setMaterialsText('Carbonless NCR Duplicate 1+1, 70 GSM Maplitho Paper');
      } else if (lower.includes('sticker') || lower.includes('vinyl')) {
        setCategory('Stickers & Decals');
        setUnit('sq.ft');
        setBasePrice(35);
        setDefaultDimensions('2x1.5 ft');
        setMaterialsText('Avery Dennison Gloss Vinyl, Matte Frosted Vinyl');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setApiError('Work Type title is required');
      return;
    }

    const finalCategory = category === 'Other / Custom' ? (customCategory.trim() || 'Other') : category;
    const materialOptions = materialsText
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    // Initial sample generation if requested
    let initialSamples: WorkSample[] = existingWorkType?.samples || [];
    if (includeInitialSample && (!existingWorkType || existingWorkType.samples.length === 0)) {
      const sampleSvg = generateDynamicSampleSvg(
        title.trim(),
        finalCategory,
        defaultDimensions.trim() || 'Standard Size',
        materialOptions[0] || 'Standard Media',
        sampleClientName.trim() || 'Sample Proof'
      );

      initialSamples = [
        {
          id: `SMP-${Date.now().toString().slice(-4)}`,
          title: `${title.trim()} Official Sample Proof`,
          description: `Standard sample specifications for ${title.trim()} (${defaultDimensions}).`,
          imageUrl: sampleSvg,
          dimensions: defaultDimensions.trim() || 'Standard Size',
          materialUsed: materialOptions[0] || 'Standard Quality Media',
          clientName: sampleClientName.trim() || 'Arya 2 Showroom',
          uploadedAt: new Date().toISOString().split('T')[0],
          fileSize: '1.2 MB',
          categoryTag: finalCategory,
        },
      ];
    }

    onSave({
      title: title.trim(),
      category: finalCategory,
      description: description.trim() || `Commercial printing services for ${title.trim()}.`,
      unit: unit.trim() || 'sq.ft',
      basePrice: Number(basePrice) || 0,
      minQuantity: Number(minQuantity) || 1,
      defaultDimensions: defaultDimensions.trim() || '10x3 ft',
      materialOptions: materialOptions.length > 0 ? materialOptions : ['Standard Media'],
      estimatedTurnaround: estimatedTurnaround.trim() || '24 Hours',
      samples: initialSamples,
      isActive: true,
      isPopular,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEditing ? 'Edit Work Type & Rate' : 'Add New Work Type / Service'}
              </h3>
              <p className="text-xs text-slate-300">
                Register a new printing service with standard pricing, media options, and proof samples
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Work Type Name & Search Grounding Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Work Type Title <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleMarketResearch}
                disabled={isSearching || !title.trim()}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSearching
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
                title="Use Google Search Grounding to find current Indian market rates & standard GSM specs"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>Searching Google...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auto-Fill Market Rates with Google</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. UV Acrylic Sign Board, Laser Cut Wedding Card, Canopy Tent..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          {/* Search Grounding Live Feedback Bar */}
          {marketInsights && (
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                <Globe className="w-3.5 h-3.5 text-emerald-700" />
                <span>Google Search Market Grounding</span>
              </div>
              <p className="text-emerald-800 text-[11px] leading-relaxed">{marketInsights}</p>
              {searchGroundingSources.length > 0 && (
                <div className="pt-1 flex flex-wrap items-center gap-2 text-[10px] text-emerald-700">
                  <span className="font-semibold">Sources:</span>
                  {searchGroundingSources.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-emerald-950 inline-flex items-center gap-0.5"
                    >
                      <span>{s.title.slice(0, 24)}...</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Category & Pricing Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600 bg-white"
              >
                {WORK_TYPE_CATEGORIES.filter((c) => c !== 'All Categories').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Other / Custom">Other / Custom Category</option>
              </select>
              {category === 'Other / Custom' && (
                <input
                  type="text"
                  placeholder="Enter custom category name"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-2 w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Base / Standard Rate (₹) &amp; Unit
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="12"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600 font-mono-code font-bold"
                  />
                </div>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-36 px-2 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600 bg-white font-medium"
                >
                  <option value="sq.ft">per sq.ft</option>
                  <option value="per 1000 pcs">per 1000 pcs</option>
                  <option value="per 100 pcs">per 100 pcs</option>
                  <option value="per piece">per piece</option>
                  <option value="per book">per book</option>
                  <option value="per page">per page</option>
                  <option value="per job">per job</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Standard Dimensions / Format
              </label>
              <input
                type="text"
                placeholder="e.g. 10x3 ft, 12x4 ft, 3.5x2 in, A4"
                value={defaultDimensions}
                onChange={(e) => setDefaultDimensions(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600 font-mono-code"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Turnaround Time
              </label>
              <input
                type="text"
                placeholder="e.g. Same Day (2-4 hrs), 24 Hours, 2-3 Days"
                value={estimatedTurnaround}
                onChange={(e) => setEstimatedTurnaround(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Available Media / Materials (Comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Star Flex 280 GSM, Korean Flex 340 GSM, Blackout Media"
                value={materialsText}
                onChange={(e) => setMaterialsText(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service Description &amp; Specifications
              </label>
              <textarea
                rows={2}
                placeholder="Provide details about print resolution, durability, standard applications, and finishing."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Initial Sample Proof Generation Option */}
          {!isEditing && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInitialSample}
                  onChange={(e) => setIncludeInitialSample(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  Generate Initial Sample Proof for this Work Type
                </span>
              </label>
              {includeInitialSample && (
                <div className="pl-6 pt-1 flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">Sample Client / Project Label:</span>
                  <input
                    type="text"
                    placeholder="e.g. Hotel Grand / Arya 2 Showroom"
                    value={sampleClientName}
                    onChange={(e) => setSampleClientName(e.target.value)}
                    className="flex-1 px-2.5 py-1 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600"
                  />
                </div>
              )}
            </div>
          )}

          {/* Checkbox: Popular */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is-popular-checkbox"
              checked={isPopular}
              onChange={(e) => setIsPopular(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="is-popular-checkbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Mark as Popular / Featured Service in New Order dropdown
            </label>
          </div>

          {apiError && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Add Work Type'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
