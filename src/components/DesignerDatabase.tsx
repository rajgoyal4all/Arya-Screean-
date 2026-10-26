import React, { useState } from 'react';
import { Designer, OrderItem, OrderStatus } from '../types';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  FileSpreadsheet,
  X,
  Palette,
  Layers,
  ChevronRight,
  Printer,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface DesignerDatabaseProps {
  designers: Designer[];
  orders: OrderItem[];
  onAddDesigner: (designer: Omit<Designer, 'id'>) => void;
  onUpdateDesigner: (designer: Designer) => void;
  onDeleteDesigner: (id: string) => void;
  onOpenReceipt: (order: OrderItem) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export const DesignerDatabase: React.FC<DesignerDatabaseProps> = ({
  designers,
  orders,
  onAddDesigner,
  onUpdateDesigner,
  onDeleteDesigner,
  onOpenReceipt,
  onUpdateOrderStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'On Leave' | 'Inactive'>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDesigner, setEditingDesigner] = useState<Designer | null>(null);
  const [selectedDesignerForOrders, setSelectedDesignerForOrders] = useState<Designer | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
    status: 'Active' as 'Active' | 'On Leave' | 'Inactive',
    skills: '',
    dailyCapacity: 8,
    notes: '',
  });

  // Calculate distinct roles
  const roles = Array.from(new Set(designers.map((d) => d.role)));

  // Helper to match an order to a designer
  const isOrderAssignedTo = (order: OrderItem, designer: Designer) => {
    const assigned = order.designerOperator.toLowerCase();
    const name = designer.name.toLowerCase();
    return (
      assigned.includes(name) ||
      assigned === designer.id.toLowerCase() ||
      assigned.startsWith(name)
    );
  };

  // Helper metrics for a designer
  const getDesignerStats = (designer: Designer) => {
    const assignedOrders = orders.filter((o) => isOrderAssignedTo(o, designer));
    const activeOrders = assignedOrders.filter(
      (o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'
    );
    const completedOrders = assignedOrders.filter(
      (o) => o.orderStatus === 'Delivered'
    );
    const totalRevenue = assignedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

    return {
      total: assignedOrders.length,
      active: activeOrders.length,
      completed: completedOrders.length,
      revenue: totalRevenue,
      assignedOrders,
    };
  };

  // Global KPIs
  const totalDesignersCount = designers.length;
  const activeStaffCount = designers.filter((d) => d.status === 'Active').length;
  const totalActiveJobs = orders.filter(
    (o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'
  ).length;
  const totalRevenueAssigned = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

  // Filtered designers
  const filteredDesigners = designers.filter((d) => {
    const matchesSearch =
      searchTerm === '' ||
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.includes(searchTerm) ||
      d.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || d.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingDesigner(null);
    setFormData({
      name: '',
      role: '',
      phone: '+91 ',
      email: '',
      status: 'Active',
      skills: 'CorelDRAW, Photoshop',
      dailyCapacity: 8,
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (designer: Designer) => {
    setEditingDesigner(designer);
    setFormData({
      name: designer.name,
      role: designer.role,
      phone: designer.phone,
      email: designer.email || '',
      status: designer.status,
      skills: designer.skills.join(', '),
      dailyCapacity: designer.dailyCapacity || 8,
      notes: designer.notes || '',
    });
    setIsAddModalOpen(true);
  };

  // Submit Add / Edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const parsedSkills = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingDesigner) {
      onUpdateDesigner({
        ...editingDesigner,
        name: formData.name.trim(),
        role: formData.role.trim() || 'Designer & Operator',
        phone: formData.phone.trim() || '+91 98370 00000',
        email: formData.email.trim(),
        status: formData.status,
        skills: parsedSkills.length > 0 ? parsedSkills : ['CorelDRAW', 'Printing'],
        dailyCapacity: Number(formData.dailyCapacity) || 8,
        notes: formData.notes.trim(),
      });
    } else {
      onAddDesigner({
        name: formData.name.trim(),
        role: formData.role.trim() || 'Designer & Operator',
        phone: formData.phone.trim() || '+91 98370 00000',
        email: formData.email.trim(),
        status: formData.status,
        skills: parsedSkills.length > 0 ? parsedSkills : ['CorelDRAW', 'Printing'],
        joinedDate: new Date().toISOString().split('T')[0],
        dailyCapacity: Number(formData.dailyCapacity) || 8,
        notes: formData.notes.trim(),
      });
    }

    setIsAddModalOpen(false);
  };

  // Export Designer Directory to Excel (.xlsx)
  const handleExportExcel = () => {
    const data = filteredDesigners.map((d) => {
      const stats = getDesignerStats(d);
      return {
        'Designer ID': d.id,
        'Full Name': d.name,
        'Role / Designation': d.role,
        'Contact Phone': d.phone,
        'Email Address': d.email,
        'Status': d.status,
        'Joined Date': d.joinedDate,
        'Software & Skills': d.skills.join(', '),
        'Active Work Orders': stats.active,
        'Completed Orders': stats.completed,
        'Total Jobs Handled': stats.total,
        'Total Job Value (₹)': stats.revenue,
        'Daily Capacity (Jobs)': d.dailyCapacity || 8,
        'Specialization Notes': d.notes || '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DESIGNER_DATABASE');
    XLSX.writeFile(wb, `ARYA2_DESIGNER_DATABASE_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Excel Sheet Header Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-600/40 text-emerald-300 font-mono-code text-[11px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                EXCEL SHEET: [DESIGNER_DATABASE]
              </span>
              <span className="text-xs text-slate-400 font-mono-code">• Production Roster</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-white mt-1">
              Arya 2 Designer & Operator Database
            </h1>
            <p className="text-xs text-slate-400">
              Manage printing specialists, graphic designers, machine operators, order allocations, and live workload.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Roster (.xlsx)</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Designer</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Designers
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono-code">
              {totalDesignersCount}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Active on Floor
            </div>
            <div className="text-2xl font-black text-emerald-700 font-mono-code">
              {activeStaffCount}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Active Jobs Queue
            </div>
            <div className="text-2xl font-black text-amber-700 font-mono-code">
              {totalActiveJobs}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Assigned Value
            </div>
            <div className="text-xl font-black text-purple-800 font-mono-code">
              ₹{totalRevenueAssigned.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Designer Name, ID (DES-001), Role, Phone, or Software skill..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {(['ALL', 'Active', 'On Leave', 'Inactive'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st}
              </button>
            ))}
          </div>

          {/* Role Filter */}
          {roles.length > 0 && (
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-emerald-600"
            >
              <option value="ALL">All Specializations ({roles.length})</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Designer Excel Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono-code font-semibold">
          <div className="flex items-center gap-2">
            <span>Worksheet: [DESIGNER_DATABASE]</span>
            <span className="text-slate-400">|</span>
            <span className="text-emerald-700 font-bold">{filteredDesigners.length} Designers listed</span>
          </div>
          <span className="text-[11px] text-slate-500">Live order allocation & capacity</span>
        </div>

        <div className="overflow-x-auto max-h-[650px] scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300 sticky top-0 z-10 select-none text-[11px]">
              <tr className="divide-x divide-slate-200">
                <th className="py-2.5 px-3 whitespace-nowrap bg-slate-100 text-center w-10">#</th>
                <th className="py-2.5 px-3 whitespace-nowrap w-24">ID</th>
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[190px]">Designer / Operator</th>
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[180px]">Role / Specialization</th>
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[140px]">Contact Phone</th>
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[180px]">Software & Skills</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center bg-amber-50/50">Active Orders</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">Completed</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">Total Jobs</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Job Value (₹)</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">Status</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center bg-slate-100 min-w-[130px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredDesigners.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    No designers found matching search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDesigners.map((designer, idx) => {
                  const stats = getDesignerStats(designer);
                  return (
                    <tr
                      key={designer.id}
                      className="hover:bg-slate-50/80 divide-x divide-slate-100 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono-code text-slate-400 bg-slate-50/50 text-center text-[11px]">
                        {idx + 1}
                      </td>

                      <td className="py-2.5 px-3 font-mono-code font-bold text-slate-800 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {designer.id}
                        </span>
                      </td>

                      {/* Designer Name & Avatar */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                            {designer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{designer.name}</span>
                              {designer.status === 'Active' && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono-code">
                              Joined: {designer.joinedDate || '2024'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 text-xs">
                          {designer.role}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-2.5 px-3 font-mono-code text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{designer.phone}</span>
                          <a
                            href={`https://wa.me/${designer.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 hover:text-emerald-800"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Skills Tags */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {designer.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono-code"
                            >
                              {skill}
                            </span>
                          ))}
                          {designer.skills.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-mono-code">
                              +{designer.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Active Orders Count (Clickable) */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap bg-amber-50/30">
                        <button
                          onClick={() => setSelectedDesignerForOrders(designer)}
                          className={`font-mono-code font-black text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            stats.active > 0
                              ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}
                          title={`View ${stats.active} orders handled by ${designer.name}`}
                        >
                          {stats.active} active
                        </button>
                      </td>

                      {/* Completed Orders */}
                      <td className="py-2.5 px-3 text-center font-mono-code font-bold text-emerald-700 whitespace-nowrap">
                        {stats.completed}
                      </td>

                      {/* Total Orders */}
                      <td className="py-2.5 px-3 text-center font-mono-code font-bold text-slate-800 whitespace-nowrap">
                        {stats.total}
                      </td>

                      {/* Total Handled Value */}
                      <td className="py-2.5 px-3 text-right font-mono-code font-bold text-slate-900 whitespace-nowrap">
                        ₹{stats.revenue.toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                            designer.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : designer.status === 'On Leave'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {designer.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap bg-slate-50/50">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedDesignerForOrders(designer)}
                            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                            title={`View orders assigned to ${designer.name}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(designer)}
                            className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                            title="Edit Designer Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (stats.active > 0) {
                                alert(
                                  `Cannot delete "${designer.name}" while they still have ${stats.active} active work order(s) assigned. Please reassign them first.`
                                );
                                return;
                              }
                              if (confirm(`Are you sure you want to remove designer "${designer.name}"?`)) {
                                onDeleteDesigner(designer.id);
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                            title="Delete Designer"
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

      {/* MODAL 1: ADD / EDIT DESIGNER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingDesigner ? 'Edit Designer Profile' : 'Register New Designer / Operator'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Staff profile in Arya 2 Production Roster
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Designer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Role / Specialization *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Flex Master & Large Format"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Floor Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'Active' | 'On Leave' | 'Inactive',
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold outline-none cursor-pointer focus:border-emerald-600"
                  >
                    <option value="Active">Active (Available for Orders)</option>
                    <option value="On Leave">On Leave (Temporary)</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98370 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono-code text-sm outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="designer@arya2.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Software & Technical Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="CorelDRAW, Photoshop, FlexiSign, Large Format, Polymer Stamp"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono-code outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Notes & Specialization
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Shift timing, machine handling, specific job types handled..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-600"
                  ></textarea>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  {editingDesigner ? 'Save Changes' : 'Register Designer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ORDERS HANDLED BY THIS DESIGNER */}
      {selectedDesignerForOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  {selectedDesignerForOrders.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      Work Orders Handled by {selectedDesignerForOrders.name}
                    </h2>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-200 text-slate-700 font-mono-code">
                      {selectedDesignerForOrders.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Role: {selectedDesignerForOrders.role} • Contact: {selectedDesignerForOrders.phone}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDesignerForOrders(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Orders Table */}
            <div className="p-6 overflow-y-auto space-y-4">
              {(() => {
                const stats = getDesignerStats(selectedDesignerForOrders);
                return (
                  <>
                    {/* Metrics Banner */}
                    <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs">
                      <div>
                        <span className="text-slate-500 text-[11px] block">Active In-Progress</span>
                        <span className="text-base font-black text-amber-700 font-mono-code">
                          {stats.active} jobs
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Completed & Delivered</span>
                        <span className="text-base font-black text-emerald-700 font-mono-code">
                          {stats.completed} jobs
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Total Order Value</span>
                        <span className="text-base font-black text-slate-900 font-mono-code">
                          ₹{stats.revenue.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {stats.assignedOrders.length === 0 ? (
                      <div className="py-12 text-center text-slate-400">
                        No orders are currently assigned to {selectedDesignerForOrders.name}.
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                            <tr>
                              <th className="py-2.5 px-3">Order ID</th>
                              <th className="py-2.5 px-3">Customer</th>
                              <th className="py-2.5 px-3">Work Type</th>
                              <th className="py-2.5 px-3">Dimensions</th>
                              <th className="py-2.5 px-3">Delivery Date</th>
                              <th className="py-2.5 px-3 text-right">Amount</th>
                              <th className="py-2.5 px-3 text-center">Status</th>
                              <th className="py-2.5 px-3 text-center">Receipt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {stats.assignedOrders.map((ord) => (
                              <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-2.5 px-3 font-mono-code font-bold text-slate-900">
                                  {ord.orderId}
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="font-semibold text-slate-900">{ord.customerName}</div>
                                  <div className="text-[10px] text-slate-500 font-mono-code">
                                    {ord.mobileNumber}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 font-medium text-slate-800">
                                  {ord.workType}
                                </td>
                                <td className="py-2.5 px-3 font-mono-code text-slate-600 text-[11px]">
                                  {ord.sizeDimensions}
                                </td>
                                <td className="py-2.5 px-3 font-mono-code text-slate-600">
                                  {ord.deliveryDate}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono-code font-bold text-slate-900">
                                  ₹{ord.amount}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <select
                                    value={ord.orderStatus}
                                    onChange={(e) =>
                                      onUpdateOrderStatus(ord.orderId, e.target.value as OrderStatus)
                                    }
                                    className={`text-[11px] font-bold px-2 py-0.5 rounded border cursor-pointer outline-none ${
                                      ord.orderStatus === 'Delivered'
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                        : ord.orderStatus === 'Ready'
                                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                                        : 'bg-amber-100 text-amber-800 border-amber-300'
                                    }`}
                                  >
                                    <option value="New">New</option>
                                    <option value="Design Pending">Design Pending</option>
                                    <option value="Designing">Designing</option>
                                    <option value="Customer Approval">Customer Approval</option>
                                    <option value="Printing">Printing</option>
                                    <option value="Finishing">Finishing</option>
                                    <option value="Ready">Ready</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <button
                                    onClick={() => onOpenReceipt(ord)}
                                    className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                                    title="View & Print Job Receipt"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedDesignerForOrders(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
