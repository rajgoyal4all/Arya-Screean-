import React, { useState } from 'react';
import { UserPlus, X, Check, Sparkles } from 'lucide-react';

interface AddDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDesigner: (designerName: string) => void;
  existingDesigners: string[];
}

const COMMON_ROLES = [
  'Flex Master',
  'DTP & Graphics',
  'Wedding Cards & Designing',
  'Offset & Screen Printing',
  'Finishing & Lamination',
  'Direct Counter Operator',
];

export const AddDesignerModal: React.FC<AddDesignerModalProps> = ({
  isOpen,
  onClose,
  onAddDesigner,
  existingDesigners,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please enter the designer or operator name');
      return;
    }

    const cleanRole = role.trim();
    const formattedName = cleanRole ? `${cleanName} (${cleanRole})` : cleanName;

    if (existingDesigners.some((d) => d.toLowerCase() === formattedName.toLowerCase())) {
      setError('This designer name is already in the list');
      return;
    }

    onAddDesigner(formattedName);
    setName('');
    setRole('');
    setError(null);
    onClose();
  };

  const previewFormatted = name.trim()
    ? role.trim()
      ? `${name.trim()} (${role.trim()})`
      : name.trim()
    : 'New Designer Preview';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-300 my-8 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                Add Designer / Operator
              </h3>
              <p className="text-xs text-slate-500">
                Arya Screen • Team & Staff Assignment
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Designer / Staff Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Arun Kumar or Pooja Singh"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm font-semibold outline-none bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Specialty / Role <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Flex Master, DTP, Wedding Cards"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-xs outline-none bg-white"
            />

            {/* Quick Suggestions */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {COMMON_ROLES.map((commonRole) => (
                <button
                  key={commonRole}
                  type="button"
                  onClick={() => setRole(commonRole)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium border transition-colors cursor-pointer ${
                    role === commonRole
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {commonRole}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
              Display Preview in Dropdowns & Receipts:
            </span>
            <div className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{previewFormatted}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save & Add Designer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
