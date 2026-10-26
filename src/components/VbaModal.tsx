import React, { useState } from 'react';
import { X, Copy, Check, Download, Code2, FileCode } from 'lucide-react';
import { ARYA_VBA_CODE, ARYA_OFFICE_SCRIPT, downloadTextFile } from '../utils/excelExporter';

interface VbaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VbaModal: React.FC<VbaModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'vba' | 'office_script'>('vba');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentCode = tab === 'vba' ? ARYA_VBA_CODE : ARYA_OFFICE_SCRIPT;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Excel Automation Code Generator
              </h3>
              <p className="text-xs text-slate-500">
                Excel VBA Macros (Desktop) & Microsoft Office Scripts (Web / Power Automate)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center justify-between mt-4 mb-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('vba')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tab === 'vba'
                  ? 'bg-purple-100 text-purple-900 border border-purple-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Excel VBA Module (.bas)
            </button>
            <button
              onClick={() => setTab('office_script')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tab === 'office_script'
                  ? 'bg-purple-100 text-purple-900 border border-purple-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Office Scripts (.ts)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={() =>
                downloadTextFile(
                  tab === 'vba' ? 'AryaScreen_Automation.bas' : 'AryaScreen_Script.ts',
                  currentCode
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Code display */}
        <div className="flex-1 overflow-y-auto mt-2">
          <pre className="p-4 bg-slate-900 text-emerald-300 rounded-xl font-mono-code text-[11px] overflow-x-auto whitespace-pre leading-relaxed">
            {currentCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
