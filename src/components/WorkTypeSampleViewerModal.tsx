import React, { useState } from 'react';
import { WorkTypeItem, WorkSample } from '../types';
import {
  X,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle2,
  Maximize2,
  IndianRupee,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react';

interface WorkTypeSampleViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  workTypes: WorkTypeItem[];
  selectedWorkTypeTitle?: string;
  onSelectWorkType?: (workTypeTitle: string) => void;
}

export const WorkTypeSampleViewerModal: React.FC<WorkTypeSampleViewerModalProps> = ({
  isOpen,
  onClose,
  workTypes,
  selectedWorkTypeTitle,
  onSelectWorkType,
}) => {
  const [activeWorkTypeId, setActiveWorkTypeId] = useState<string>(() => {
    const matched = workTypes.find(
      (wt) => wt.title.toLowerCase() === selectedWorkTypeTitle?.toLowerCase()
    );
    return matched ? matched.id : workTypes[0]?.id || '';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxSample, setLightboxSample] = useState<WorkSample | null>(null);

  if (!isOpen) return null;

  const currentWorkType =
    workTypes.find((wt) => wt.id === activeWorkTypeId) || workTypes[0];

  const filteredWorkTypes = workTypes.filter(
    (wt) =>
      wt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wt.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Work Types &amp; Sample Catalog for Customers
              </h3>
              <p className="text-[11px] text-slate-300">
                Show live printed proofs, standard sizes, and rate cards to walk-in clients
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Split Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Work Types List */}
          <div className="w-64 sm:w-72 border-r border-slate-200 bg-slate-50/50 flex flex-col">
            <div className="p-3 border-b border-slate-200">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter work types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredWorkTypes.map((wt) => {
                const isSelected = wt.id === currentWorkType?.id;
                return (
                  <button
                    key={wt.id}
                    onClick={() => setActiveWorkTypeId(wt.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-800 text-white shadow-xs font-bold'
                        : 'hover:bg-slate-200/60 text-slate-700 font-medium'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="text-xs truncate">{wt.title}</p>
                      <p
                        className={`text-[10px] truncate ${
                          isSelected ? 'text-emerald-200' : 'text-slate-400'
                        }`}
                      >
                        {wt.category} · ₹{wt.basePrice}/{wt.unit}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? 'bg-emerald-700 text-emerald-100'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {wt.samples?.length || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Content Viewport: Active Work Type Details & Samples Gallery */}
          {currentWorkType ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Work Type Header Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                      {currentWorkType.category}
                    </span>
                    <h2 className="text-xl font-black text-white mt-1.5">
                      {currentWorkType.title}
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                      {currentWorkType.description}
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 text-right sm:text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Standard Shop Rate
                    </span>
                    <span className="text-2xl font-black text-amber-400 font-mono-code">
                      ₹{currentWorkType.basePrice}
                    </span>
                    <span className="text-xs text-slate-300 ml-1">
                      / {currentWorkType.unit}
                    </span>
                  </div>
                </div>

                {/* Specs Pill Strip */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                    Standard Size: <b className="text-white font-mono-code">{currentWorkType.defaultDimensions}</b>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Turnaround: <b className="text-white">{currentWorkType.estimatedTurnaround}</b>
                  </span>
                  <span>•</span>
                  <span>
                    Min Qty: <b className="text-white">{currentWorkType.minQuantity} {currentWorkType.unit}</b>
                  </span>
                </div>
              </div>

              {/* Material Options */}
              {currentWorkType.materialOptions && currentWorkType.materialOptions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Available Media &amp; GSM Options
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentWorkType.materialOptions.map((mat, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Proofs Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    Proof Samples &amp; Visual Mockups ({currentWorkType.samples?.length || 0})
                  </h4>
                </div>

                {currentWorkType.samples && currentWorkType.samples.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentWorkType.samples.map((sample) => (
                      <div
                        key={sample.id}
                        onClick={() => setLightboxSample(sample)}
                        className="group bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-xl overflow-hidden cursor-pointer shadow-xs transition-all hover:shadow-md"
                      >
                        <div className="h-44 bg-slate-900 flex items-center justify-center relative overflow-hidden p-2">
                          <img
                            src={sample.imageUrl}
                            alt={sample.title}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs">
                            <Maximize2 className="w-4 h-4" /> Click to Zoom
                          </div>
                          {sample.dimensions && (
                            <span className="absolute bottom-2 right-2 bg-slate-900/85 text-amber-300 font-mono-code font-bold text-[10px] px-2 py-0.5 rounded border border-slate-700">
                              {sample.dimensions}
                            </span>
                          )}
                        </div>
                        <div className="p-3">
                          <h5 className="text-xs font-bold text-slate-800 truncate">
                            {sample.title}
                          </h5>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                            <span>{sample.materialUsed || 'Standard Media'}</span>
                            <span className="text-emerald-700 font-semibold">{sample.clientName || 'Showroom'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50">
                    <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-600">No samples uploaded yet for this work type</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      You can add proof samples in the "Work Types &amp; Samples" tab.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-slate-400">
              Select a work type from the left to view samples
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Total {workTypes.length} printing services registered in Arya 2 database
          </span>
          <div className="flex items-center gap-3">
            {onSelectWorkType && currentWorkType && (
              <button
                type="button"
                onClick={() => {
                  onSelectWorkType(currentWorkType.title);
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Select &amp; Use "{currentWorkType.title}"</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Fullscreen Zoom */}
      {lightboxSample && currentWorkType && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/90 flex items-center justify-center p-4"
          onClick={() => setLightboxSample(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxSample(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-5 h-5" /> Close
            </button>
            <img
              src={lightboxSample.imageUrl}
              alt={lightboxSample.title}
              className="max-h-[80vh] object-contain rounded-xl shadow-2xl border border-slate-800"
            />
            <div className="mt-3 text-center text-white">
              <h4 className="font-bold text-sm">{lightboxSample.title}</h4>
              <p className="text-xs text-slate-400">
                {lightboxSample.dimensions} • {lightboxSample.materialUsed} • {lightboxSample.clientName}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
