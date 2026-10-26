import React, { useState, useMemo } from 'react';
import { InventoryItem, InventoryCategory } from '../types';
import { INVENTORY_CATEGORIES, exportInventoryToCSV } from '../utils/inventoryStorage';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ArrowUpDown,
  Download,
  Edit2,
  Trash2,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  DollarSign,
  Layers,
  MapPin,
  Truck,
  Printer,
  X,
  RefreshCw,
} from 'lucide-react';

interface InventoryViewProps {
  items: InventoryItem[];
  onAddItem: (item: InventoryItem) => void;
  onUpdateItem: (item: InventoryItem) => void;
  onDeleteItem: (itemId: string) => void;
  onAdjustStock: (itemId: string, delta: number, reason: string) => void;
  onNavigateToFinance: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAdjustStock,
  onNavigateToFinance,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'add' | 'deduct'>('add');
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('Stock Restock / Purchase');

  // Form states for Add/Edit item
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    category: 'Flex Rolls',
    currentStock: 10,
    unit: 'Rolls',
    minStockAlert: 3,
    purchaseCost: 1000,
    sellingPrice: 1500,
    location: '',
    supplier: '',
    notes: '',
  });

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const matchLowStock = !showLowStockOnly || item.currentStock <= item.minStockAlert;

      return matchSearch && matchCategory && matchLowStock;
    });
  }, [items, searchTerm, selectedCategory, showLowStockOnly]);

  // Aggregate stats
  const stats = useMemo(() => {
    let totalStockValue = 0;
    let totalPotentialRevenue = 0;
    let lowStockCount = 0;

    items.forEach((item) => {
      totalStockValue += item.currentStock * item.purchaseCost;
      totalPotentialRevenue += item.currentStock * item.sellingPrice;
      if (item.currentStock <= item.minStockAlert) {
        lowStockCount += 1;
      }
    });

    return {
      totalItems: items.length,
      totalStockValue,
      totalPotentialRevenue,
      lowStockCount,
    };
  }, [items]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Flex Rolls',
      currentStock: 5,
      unit: 'Rolls',
      minStockAlert: 2,
      purchaseCost: 1500,
      sellingPrice: 2200,
      location: 'Rack A1',
      supplier: '',
      notes: '',
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingItem) {
      const updated: InventoryItem = {
        ...editingItem,
        name: formData.name.trim(),
        category: (formData.category as InventoryCategory) || 'Flex Rolls',
        currentStock: Number(formData.currentStock) || 0,
        unit: formData.unit || 'Pcs',
        minStockAlert: Number(formData.minStockAlert) || 1,
        purchaseCost: Number(formData.purchaseCost) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        location: formData.location?.trim() || '',
        supplier: formData.supplier?.trim() || '',
        notes: formData.notes?.trim() || '',
        lastRestocked: editingItem.lastRestocked,
      };
      onUpdateItem(updated);
    } else {
      const newItem: InventoryItem = {
        id: `INV-${Date.now().toString().slice(-4)}`,
        name: formData.name.trim(),
        category: (formData.category as InventoryCategory) || 'Flex Rolls',
        currentStock: Number(formData.currentStock) || 0,
        unit: formData.unit || 'Pcs',
        minStockAlert: Number(formData.minStockAlert) || 1,
        purchaseCost: Number(formData.purchaseCost) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        location: formData.location?.trim() || '',
        supplier: formData.supplier?.trim() || '',
        notes: formData.notes?.trim() || '',
        lastRestocked: new Date().toISOString().split('T')[0],
      };
      onAddItem(newItem);
    }
    setIsItemModalOpen(false);
  };

  const handleOpenAdjustModal = (item: InventoryItem, type: 'add' | 'deduct') => {
    setAdjustingItem(item);
    setAdjustType(type);
    setAdjustQty(1);
    setAdjustReason(type === 'add' ? 'Stock Restock / Supplier Delivery' : 'Job Consumption / Wastage');
  };

  const handleConfirmAdjust = () => {
    if (!adjustingItem || adjustQty <= 0) return;
    const delta = adjustType === 'add' ? adjustQty : -adjustQty;
    onAdjustStock(adjustingItem.id, delta, adjustReason);
    setAdjustingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  Inventory & Raw Materials Stock
                </h1>
                <p className="text-xs text-slate-500">
                  Arya Screen Printing stock tracking for flex rolls, solvent inks, vinyl, frames & paper
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => exportInventoryToCSV(items)}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-600" />
              Export Inventory CSV
            </button>
            <button
              onClick={onNavigateToFinance}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Income & Expense Ledger
            </button>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Add New Item
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Items in Stock</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{stats.totalItems}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Across {INVENTORY_CATEGORIES.length} categories</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Stock Value (Cost)</span>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-1">
              ₹{stats.totalStockValue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">
              ₹{stats.totalPotentialRevenue.toLocaleString('en-IN')} potential sales
            </div>
          </div>

          <div className={`border rounded-lg p-4 ${stats.lowStockCount > 0 ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">Low Stock Alert</span>
              <AlertTriangle className={`w-4 h-4 ${stats.lowStockCount > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
            </div>
            <div className={`text-2xl font-bold mt-1 ${stats.lowStockCount > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
              {stats.lowStockCount} Items
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {stats.lowStockCount > 0 ? 'Needs reordering soon' : 'Stock levels healthy'}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-800">Shop Machine & Inks</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">4-Color CMYK</div>
            <div className="text-[11px] text-emerald-700 mt-0.5">Solvent printing ready</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by item name, ID, rack or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories ({items.length})</option>
                {INVENTORY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                showLowStockOnly
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Low Stock Only ({stats.lowStockCount})
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider font-mono-code">
                <th className="py-3 px-4">Code / Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Stock Valuation</th>
                <th className="py-3 px-4">Location & Supplier</th>
                <th className="py-3 px-4 text-center">Quick Stock Adjust</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No inventory items found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try resetting your search or filter, or add a new stock item.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.currentStock <= item.minStockAlert;
                  const totalVal = item.currentStock * item.purchaseCost;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isLow ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2">
                          <div>
                            <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                              {item.id}
                            </span>
                            <div className="font-semibold text-slate-800 mt-0.5">{item.name}</div>
                            {item.notes && (
                              <div className="text-[11px] text-slate-400 truncate max-w-xs">{item.notes}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`font-bold text-sm px-2.5 py-0.5 rounded-full ${
                              isLow
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {item.currentStock} {item.unit}
                          </span>
                          {isLow && (
                            <span className="text-[10px] text-red-600 font-semibold mt-0.5 flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> Min: {item.minStockAlert}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                        ₹{item.purchaseCost.toLocaleString('en-IN')}
                        <span className="text-[10px] text-slate-400 block">/{item.unit}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-700">
                        ₹{item.sellingPrice.toLocaleString('en-IN')}
                        <span className="text-[10px] text-slate-400 block">/{item.unit}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                        ₹{totalVal.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-[11px] space-y-0.5">
                          {item.location && (
                            <div className="flex items-center gap-1 text-slate-600">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{item.location}</span>
                            </div>
                          )}
                          {item.supplier && (
                            <div className="flex items-center gap-1 text-slate-500">
                              <Truck className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[140px]">{item.supplier}</span>
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 font-mono">
                            Restocked: {item.lastRestocked}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenAdjustModal(item, 'add')}
                            className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors cursor-pointer"
                            title="Restock / Add Quantity"
                          >
                            <PlusCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleOpenAdjustModal(item, 'deduct')}
                            className="p-1 rounded hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="Deduct / Consume Stock"
                          >
                            <MinusCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 hover:bg-slate-100 text-blue-600 rounded-md transition-colors cursor-pointer"
                            title="Edit Item Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete item "${item.name}"?`)) {
                                onDeleteItem(item.id);
                              }
                            }}
                            className="p-1.5 hover:bg-slate-100 text-rose-600 rounded-md transition-colors cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">
                {editingItem ? 'Edit Stock Item' : 'Add New Inventory Item'}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Star Frontlit Flex (240 GSM, 10ft roll)"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category || 'Flex Rolls'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as InventoryCategory })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {INVENTORY_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Measurement Unit *
                  </label>
                  <select
                    value={formData.unit || 'Rolls'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Rolls">Rolls</option>
                    <option value="sq.ft">sq.ft</option>
                    <option value="Liters">Liters</option>
                    <option value="Packets">Packets</option>
                    <option value="Sheets">Sheets</option>
                    <option value="Pcs">Pcs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Current Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formData.currentStock ?? 0}
                    onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Low Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.minStockAlert ?? 2}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Purchase Cost / Unit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formData.purchaseCost ?? 0}
                    onChange={(e) => setFormData({ ...formData, purchaseCost: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Selling / Billing Rate (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formData.sellingPrice ?? 0}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Rack / Storage Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rack A1, Ink Shelf"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vendor / Supplier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Radhey Vinyl Hub"
                    value={formData.supplier || ''}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes / Technical Specifications
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional details about gsm, compatibility, etc."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                {adjustType === 'add' ? (
                  <>
                    <PlusCircle className="w-5 h-5 text-emerald-600" />
                    <span>Restock Item: {adjustingItem.name}</span>
                  </>
                ) : (
                  <>
                    <MinusCircle className="w-5 h-5 text-rose-600" />
                    <span>Deduct / Consume Stock: {adjustingItem.name}</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setAdjustingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Current On-Hand Stock:</span>
                  <span className="font-bold text-slate-800">
                    {adjustingItem.currentStock} {adjustingItem.unit}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Unit Cost:</span>
                  <span className="font-mono">₹{adjustingItem.purchaseCost}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {adjustType === 'add' ? 'Quantity to Add' : 'Quantity to Deduct'} ({adjustingItem.unit}) *
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full text-sm font-bold border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reason / Purpose *
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Supplier delivery, Job printing usage, Damaged roll"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                New Stock Balance after update:{' '}
                <span className="font-bold">
                  {adjustType === 'add'
                    ? adjustingItem.currentStock + adjustQty
                    : Math.max(0, adjustingItem.currentStock - adjustQty)}{' '}
                  {adjustingItem.unit}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAdjust}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-xs transition-colors cursor-pointer ${
                    adjustType === 'add'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm Adjustment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
