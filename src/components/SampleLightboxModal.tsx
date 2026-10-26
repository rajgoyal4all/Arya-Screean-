import React, { useState } from 'react';
import { WorkSample, WorkTypeItem } from '../types';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Calendar,
  Layers,
  Maximize2,
  Trash2,
  UserPlus,
  Tag,
  FileCheck,
} from 'lucide-react';

interface SampleLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  sample: WorkSample | null;
  workType: WorkTypeItem | null;
  onDeleteSample?: (workTypeId: string, sampleId: string) => void;
  onSelectForNewOrder?: (workTypeTitle: string) => void;
}

export const SampleLightboxModal: React.FC<SampleLightboxModalProps> = ({
  isOpen,
  onClose,
  sample,
  workType,
  onDeleteSample,
  onSelectForNewOrder,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!isOpen || !sample || !workType) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = sample.imageUrl;
    link.download = `${sample.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_sample.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden text-white">
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white truncate max-w-md">
                {sample.title}
              </h3>
              <p className="text-[11px] text-slate-400">
                {workType.title} · {workType.category} · Standard Rate: ₹{workType.basePrice}/{workType.unit}
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden sm:flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 py-1 text-[10px] font-mono-code text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                title="Reset Zoom"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Download High-Res Proof"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download Proof</span>
            </button>

            {onDeleteSample && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete sample "${sample.title}"?`)) {
                    onDeleteSample(workType.id, sample.id);
                    onClose();
                  }
                }}
                className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                title="Delete Sample"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Viewport */}
        <div className="flex-1 bg-slate-950/60 p-4 sm:p-8 flex items-center justify-center overflow-auto min-h-[320px] max-h-[60vh]">
          <div
            style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease-out' }}
            className="flex items-center justify-center max-w-full max-h-full"
          >
            <img
              src={sample.imageUrl}
              alt={sample.title}
              className="max-h-[50vh] max-w-full object-contain rounded-lg shadow-2xl border border-slate-800"
            />
          </div>
        </div>

        {/* Bottom Details Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Dimensions</span>
              <span className="font-bold text-amber-300 font-mono-code">{sample.dimensions || workType.defaultDimensions}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Media / Material</span>
              <span className="font-bold text-slate-200">{sample.materialUsed || 'Standard Media'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Client / Project</span>
              <span className="font-bold text-emerald-400 truncate max-w-[140px] block">
                {sample.clientName || 'Standard Showroom Proof'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Added Date</span>
              <span className="font-medium text-slate-300">{sample.uploadedAt}</span>
            </div>
          </div>

          {onSelectForNewOrder && (
            <button
              type="button"
              onClick={() => {
                onSelectForNewOrder(workType.title);
                onClose();
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Order with this Work Type</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
