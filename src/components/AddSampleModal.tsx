import React, { useState, useRef } from 'react';
import { WorkTypeItem, WorkSample } from '../types';
import { generateDynamicSampleSvg } from '../utils/sampleArtworks';
import {
  X,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileImage,
} from 'lucide-react';

interface AddSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  workType: WorkTypeItem;
  onAddSample: (
    workTypeId: string,
    sample: Omit<WorkSample, 'id' | 'uploadedAt'>
  ) => void;
}

export const AddSampleModal: React.FC<AddSampleModalProps> = ({
  isOpen,
  onClose,
  workType,
  onAddSample,
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'url' | 'generate'>('upload');
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [dimensions, setDimensions] = useState(workType.defaultDimensions || '');
  const [materialUsed, setMaterialUsed] = useState(
    workType.materialOptions?.[0] || ''
  );
  const [description, setDescription] = useState('');
  const [categoryTag, setCategoryTag] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewError, setPreviewError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPreviewError('Please select a valid image file (PNG, JPG, SVG, WebP)');
      return;
    }

    setPreviewError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageUrl(result);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate branded SVG sample preview mockup
  const handleGenerateMockup = () => {
    const sampleTitle = title.trim() || `${workType.title} Sample`;
    const genSvg = generateDynamicSampleSvg(
      sampleTitle,
      workType.category,
      dimensions || workType.defaultDimensions,
      materialUsed || 'Standard Media',
      clientName.trim() || 'Client Project'
    );
    setImageUrl(genSvg);
    setPreviewError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setPreviewError('Please enter a sample title');
      return;
    }
    if (!imageUrl) {
      setPreviewError('Please upload an image, enter an image URL, or generate a mockup preview');
      return;
    }

    onAddSample(workType.id, {
      title: title.trim(),
      description: description.trim(),
      imageUrl,
      dimensions: dimensions.trim() || workType.defaultDimensions,
      materialUsed: materialUsed.trim() || 'Standard Media',
      clientName: clientName.trim(),
      categoryTag: categoryTag.trim() || workType.category,
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
              <FileImage className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Add Sample Proof / Artwork
              </h3>
              <p className="text-xs text-slate-300">
                Work Type: <span className="text-emerald-400 font-semibold">{workType.title}</span> ({workType.category})
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

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Source Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Artwork Source
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('upload');
                  setPreviewError('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  activeMode === 'upload'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMode('url');
                  setPreviewError('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  activeMode === 'url'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Image Link</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMode('generate');
                  setPreviewError('');
                  handleGenerateMockup();
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  activeMode === 'generate'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Auto-Generate</span>
              </button>
            </div>
          </div>

          {/* Mode 1: File Upload */}
          {activeMode === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/30 group"
              >
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-600 mx-auto mb-2 transition-colors" />
                <p className="text-xs font-bold text-slate-700">
                  Click to browse or drop sample image
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports JPG, PNG, WebP, SVG (banner photos, card scans, proof mockups)
                </p>
              </div>
            </div>
          )}

          {/* Mode 2: Direct URL */}
          {activeMode === 'url' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Image Web Link or Google Drive URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/sample-banner.jpg"
                  value={imageUrl.startsWith('data:') ? '' : imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          )}

          {/* Mode 3: Branded Mockup Generator */}
          {activeMode === 'generate' && (
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  Instant Branded Sample Proof Generator
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Generates an authentic vector proof mockup for {workType.title} with custom specs and Arya 2 studio styling.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerateMockup}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Re-Generate
              </button>
            </div>
          )}

          {/* Image Preview Box */}
          {imageUrl && (
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" /> Sample Preview
                </span>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  Clear Image
                </button>
              </div>
              <div className="max-h-56 overflow-hidden rounded-lg bg-black/40 flex items-center justify-center p-2">
                <img
                  src={imageUrl}
                  alt="Sample Preview"
                  className="max-h-52 object-contain rounded shadow-lg"
                  onError={() => setPreviewError('Failed to load image from URL. Please check the link.')}
                />
              </div>
            </div>
          )}

          {/* Sample Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sample Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Shri Radhey Sweets 12x4 ft Star Frontlit Banner"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client / Project Name
              </label>
              <input
                type="text"
                placeholder="e.g. Radhey Sweets / Chhata Cricket League"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dimensions / Size
              </label>
              <input
                type="text"
                placeholder="e.g. 12x4 ft, 3.5x2 in, A4"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600 font-mono-code"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Material Used
              </label>
              <select
                value={materialUsed}
                onChange={(e) => setMaterialUsed(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600 bg-white"
              >
                {workType.materialOptions?.map((mat) => (
                  <option key={mat} value={mat}>
                    {mat}
                  </option>
                ))}
                <option value="Custom Media">Other / Custom Media</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sub-Category / Tag
              </label>
              <input
                type="text"
                placeholder="e.g. Shop Hoarding, Velvet Foil, Spot UV"
                value={categoryTag}
                onChange={(e) => setCategoryTag(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description / Key Design Features
              </label>
              <textarea
                rows={2}
                placeholder="e.g. High resolution 720 DPI print with 1-inch border margin and heavy grommets on corners."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {previewError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{previewError}</span>
            </div>
          )}

          {/* Footer Action Buttons */}
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
              <span>Save Sample to Portfolio</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
