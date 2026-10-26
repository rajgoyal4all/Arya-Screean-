import React, { useState } from 'react';
import { WorkTypeItem, WorkSample, ActiveTab } from '../types';
import { WORK_TYPE_CATEGORIES } from '../utils/defaultWorkTypes';
import { AddWorkTypeModal } from './AddWorkTypeModal';
import { AddSampleModal } from './AddSampleModal';
import { SampleLightboxModal } from './SampleLightboxModal';
import {
  Layers,
  Plus,
  Search,
  Sparkles,
  Download,
  IndianRupee,
  Maximize2,
  Clock,
  Image as ImageIcon,
  Edit2,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Tag,
  Grid,
  List,
  LayoutGrid,
  FileSpreadsheet,
  UserPlus,
  Eye,
  Filter,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface WorkTypesCatalogProps {
  workTypes: WorkTypeItem[];
  onAddWorkType: (item: Omit<WorkTypeItem, 'id' | 'createdAt'>) => void;
  onUpdateWorkType: (item: WorkTypeItem) => void;
  onDeleteWorkType: (id: string) => void;
  onAddSample: (
    workTypeId: string,
    sample: Omit<WorkSample, 'id' | 'uploadedAt'>
  ) => void;
  onDeleteSample: (workTypeId: string, sampleId: string) => void;
  onSelectForNewOrder: (workTypeTitle: string) => void;
  userRole?: 'admin' | 'customer';
}

export const WorkTypesCatalog: React.FC<WorkTypesCatalogProps> = ({
  workTypes,
  onAddWorkType,
  onUpdateWorkType,
  onDeleteWorkType,
  onAddSample,
  onDeleteSample,
  onSelectForNewOrder,
  userRole = 'admin',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [viewMode, setViewMode] = useState<'cards' | 'gallery' | 'table'>('cards');

  // Modal States
  const [isAddWorkTypeOpen, setIsAddWorkTypeOpen] = useState(false);
  const [editingWorkType, setEditingWorkType] = useState<WorkTypeItem | null>(null);
  const [sampleTargetWorkType, setSampleTargetWorkType] = useState<WorkTypeItem | null>(null);
  const [lightboxSample, setLightboxSample] = useState<{
    sample: WorkSample;
    workType: WorkTypeItem;
  } | null>(null);

  // Filtered List
  const filteredWorkTypes = workTypes.filter((wt) => {
    const matchesCategory =
      selectedCategory === 'All Categories' || wt.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesQuery =
      wt.title.toLowerCase().includes(q) ||
      wt.category.toLowerCase().includes(q) ||
      wt.description.toLowerCase().includes(q) ||
      wt.materialOptions?.some((m) => m.toLowerCase().includes(q)) ||
      wt.samples?.some(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.clientName?.toLowerCase().includes(q)
      );

    return matchesCategory && matchesQuery;
  });

  // Calculate Metrics
  const totalSamples = workTypes.reduce(
    (acc, wt) => acc + (wt.samples?.length || 0),
    0
  );
  const outdoorCount = workTypes.filter(
    (wt) => wt.category === 'Outdoor Signage'
  ).length;
  const cardsDtpCount = workTypes.filter(
    (wt) =>
      wt.category === 'Cards & Stationery' ||
      wt.category === 'DTP & Office Stationery' ||
      wt.category === 'Wedding & Invitations'
  ).length;

  // Export Rate List to Excel (.xlsx)
  const handleExportRateList = () => {
    const rows = workTypes.map((wt, index) => ({
      'S.No': index + 1,
      'Work Type Code': wt.id,
      'Work Type Title': wt.title,
      'Category': wt.category,
      'Base Rate (INR)': wt.basePrice,
      'Billing Unit': wt.unit,
      'Standard Dimensions': wt.defaultDimensions,
      'Turnaround Time': wt.estimatedTurnaround,
      'Available Materials': wt.materialOptions?.join(' | '),
      'Sample Proofs Count': wt.samples?.length || 0,
      'Popular Item': wt.isPopular ? 'YES' : 'NO',
      'Description': wt.description,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'RATE_LIST');
    XLSX.writeFile(workbook, `ARYA2_WORK_TYPES_RATE_LIST_${new Date().getFullYear()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Ribbon Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-700 text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                Work Types &amp; Sample Portfolio
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {workTypes.length} Services
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Manage all printing &amp; designing services, standard market rates, materials, and visual proof samples
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        {userRole === 'admin' ? (
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={handleExportRateList}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-200"
              title="Download Rate List Excel sheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Rate List</span>
            </button>

            <button
              onClick={() => {
                setEditingWorkType(null);
                setIsAddWorkTypeOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Work Type</span>
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Customer View • High-Res Samples & Specifications</span>
          </div>
        )}
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Registered Services
          </span>
          <span className="text-2xl font-black text-slate-900 font-mono-code">
            {workTypes.length}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
            Active in Order Menu
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Visual Proof Samples
          </span>
          <span className="text-2xl font-black text-emerald-700 font-mono-code">
            {totalSamples}
          </span>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
            Proofs &amp; Mockups
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Outdoor &amp; Signage
          </span>
          <span className="text-2xl font-black text-blue-700 font-mono-code">
            {outdoorCount}
          </span>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
            Flex, Banners, Glow Signs
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Cards &amp; Stationery
          </span>
          <span className="text-2xl font-black text-purple-700 font-mono-code">
            {cardsDtpCount}
          </span>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
            Visiting, Wedding, Bill Books
          </span>
        </div>
      </div>

      {/* Search, Filter Bar & View Switcher */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search work types, materials, proof samples, dimensions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs font-medium outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Catalog Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('gallery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'gallery'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Visual Samples Gallery View"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Sample Gallery</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Compact Rate Sheet Table"
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills (Functional Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {WORK_TYPE_CATEGORIES.map((cat) => {
            const count =
              cat === 'All Categories'
                ? workTypes.length
                : workTypes.filter((w) => w.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-emerald-700 text-emerald-100'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN VIEW 1: Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredWorkTypes.map((workType) => (
            <div
              key={workType.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:border-slate-300 transition-all hover:shadow-md"
            >
              {/* Card Header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {workType.category}
                      </span>
                      {workType.isPopular && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                          ★ Popular
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-slate-900 mt-1">
                      {workType.title}
                    </h3>
                  </div>

                  {/* Pricing Badge */}
                  <div className="text-right shrink-0">
                    <span className="text-lg font-black text-emerald-800 font-mono-code block">
                      ₹{workType.basePrice}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      / {workType.unit}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {workType.description}
                </p>

                {/* Key Specs Row */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-mono-code font-bold text-slate-700">
                    <Maximize2 className="w-3 h-3 text-emerald-600" />
                    {workType.defaultDimensions}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <Clock className="w-3 h-3 text-amber-600" />
                    {workType.estimatedTurnaround}
                  </span>
                  <span>·</span>
                  <span className="text-slate-500">
                    Min: {workType.minQuantity} {workType.unit}
                  </span>
                </div>

                {/* Media Tags */}
                {workType.materialOptions && workType.materialOptions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {workType.materialOptions.slice(0, 3).map((mat, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 rounded text-[10px] font-medium"
                      >
                        {mat}
                      </span>
                    ))}
                    {workType.materialOptions.length > 3 && (
                      <span className="px-1.5 py-0.5 text-slate-400 text-[10px]">
                        +{workType.materialOptions.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Sample Proofs Strip */}
              <div className="px-5 py-3 bg-slate-50/70 border-t border-b border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    Proof Samples ({workType.samples?.length || 0})
                  </span>
                  <button
                    onClick={() => setSampleTargetWorkType(workType)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Sample</span>
                  </button>
                </div>

                {workType.samples && workType.samples.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {workType.samples.map((sample) => (
                      <div
                        key={sample.id}
                        onClick={() =>
                          setLightboxSample({ sample, workType })
                        }
                        className="group relative h-28 bg-slate-900 rounded-xl overflow-hidden cursor-pointer border border-slate-200 shadow-2xs hover:border-emerald-500 transition-all flex items-center justify-center p-1.5"
                      >
                        <img
                          src={sample.imageUrl}
                          alt={sample.title}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-[11px] font-bold">
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Proof</span>
                        </div>
                        <span className="absolute bottom-1 left-1 max-w-[85%] truncate text-[9px] font-bold text-slate-200 bg-slate-900/80 px-1.5 py-0.5 rounded">
                          {sample.title}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => setSampleTargetWorkType(workType)}
                    className="border border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer bg-white hover:bg-emerald-50/40 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-700">No samples yet</p>
                    <p className="text-[10px] text-slate-400">Click to upload photo or generate proof</p>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 px-5 flex items-center justify-between gap-2 mt-auto bg-white">
                <button
                  type="button"
                  onClick={() => onSelectForNewOrder(workType.title)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Use in Order</span>
                </button>

                {userRole === 'admin' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSampleTargetWorkType(workType)}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                      title="Add Sample Proof"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Add Sample</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingWorkType(workType);
                        setIsAddWorkTypeOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Work Type"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete work type "${workType.title}"?`)) {
                          onDeleteWorkType(workType.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Work Type"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MAIN VIEW 2: Visual Sample Gallery */}
      {viewMode === 'gallery' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredWorkTypes.flatMap((wt) =>
              (wt.samples || []).map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => setLightboxSample({ sample, workType: wt })}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col hover:border-emerald-500"
                >
                  <div className="h-52 bg-slate-950 flex items-center justify-center p-3 relative overflow-hidden">
                    <img
                      src={sample.imageUrl}
                      alt={sample.title}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs">
                      <Maximize2 className="w-4 h-4" /> Click to Zoom
                    </div>
                    {sample.dimensions && (
                      <span className="absolute bottom-2 right-2 bg-slate-900/80 text-amber-300 font-mono-code font-bold text-[10px] px-2 py-0.5 rounded border border-slate-700">
                        {sample.dimensions}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-bold uppercase tracking-wider text-emerald-700">
                          {wt.title}
                        </span>
                        <span>{sample.uploadedAt}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {sample.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {sample.description || `${sample.materialUsed || 'Standard Media'} proof for ${sample.clientName || 'Showroom'}.`}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-medium">
                        ₹{wt.basePrice}/{wt.unit}
                      </span>
                      <span className="text-emerald-700 font-bold group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MAIN VIEW 3: Compact Rate Sheet Table */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-mono-code text-[11px]">
                  <th className="p-3 px-4">Code</th>
                  <th className="p-3">Work Type / Service</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Rate (INR)</th>
                  <th className="p-3">Dimensions</th>
                  <th className="p-3">Turnaround</th>
                  <th className="p-3">Samples</th>
                  <th className="p-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredWorkTypes.map((wt) => (
                  <tr key={wt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 px-4 font-mono-code font-bold text-slate-400">
                      {wt.id}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{wt.title}</span>
                        {wt.isPopular && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold">
                            ★
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-slate-600">{wt.category}</td>
                    <td className="p-3 font-mono-code font-bold text-emerald-800">
                      ₹{wt.basePrice} / {wt.unit}
                    </td>
                    <td className="p-3 font-mono-code text-slate-600">
                      {wt.defaultDimensions}
                    </td>
                    <td className="p-3 text-slate-600">{wt.estimatedTurnaround}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setSampleTargetWorkType(wt)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded hover:bg-emerald-100 cursor-pointer"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>{wt.samples?.length || 0} proofs</span>
                      </button>
                    </td>
                    <td className="p-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectForNewOrder(wt.title)}
                          className="px-2 py-1 bg-slate-900 text-white rounded text-[10px] font-bold hover:bg-emerald-700 cursor-pointer transition-colors"
                        >
                          Use in Order
                        </button>
                        {userRole === 'admin' && (
                          <button
                            onClick={() => {
                              setEditingWorkType(wt);
                              setIsAddWorkTypeOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-800 rounded cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Work Type Modal */}
      {isAddWorkTypeOpen && (
        <AddWorkTypeModal
          isOpen={isAddWorkTypeOpen}
          onClose={() => {
            setIsAddWorkTypeOpen(false);
            setEditingWorkType(null);
          }}
          existingWorkType={editingWorkType}
          onSave={(data) => {
            if (editingWorkType) {
              onUpdateWorkType({ ...data, id: editingWorkType.id, createdAt: editingWorkType.createdAt });
            } else {
              onAddWorkType(data);
            }
          }}
        />
      )}

      {/* Add Sample Modal */}
      {sampleTargetWorkType && (
        <AddSampleModal
          isOpen={Boolean(sampleTargetWorkType)}
          onClose={() => setSampleTargetWorkType(null)}
          workType={sampleTargetWorkType}
          onAddSample={(workTypeId, sample) => {
            onAddSample(workTypeId, sample);
            setSampleTargetWorkType(null);
          }}
        />
      )}

      {/* Lightbox Modal */}
      {lightboxSample && (
        <SampleLightboxModal
          isOpen={Boolean(lightboxSample)}
          onClose={() => setLightboxSample(null)}
          sample={lightboxSample.sample}
          workType={lightboxSample.workType}
          onDeleteSample={onDeleteSample}
          onSelectForNewOrder={onSelectForNewOrder}
        />
      )}
    </div>
  );
};
