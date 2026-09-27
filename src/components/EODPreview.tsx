import React, { useState } from 'react';
import type { TaskItem } from '../types/eod';
import { generateReportText } from '../utils/textGenerator';
import { Copy, Check, Eye, Code } from 'lucide-react';

interface EODPreviewProps {
  memberName: string;
  formattedDate: string;
  tasks: TaskItem[];
  achievements: string;
  pendingWork: string[];
  blockers: string[];
  tomorrowPriorities: string[];
  additionalUpdate: string;
  onCopySuccess?: () => void;
}

export const EODPreview: React.FC<EODPreviewProps> = ({
  memberName,
  formattedDate,
  tasks,
  achievements,
  pendingWork,
  blockers,
  tomorrowPriorities,
  additionalUpdate,
  onCopySuccess
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'styled' | 'raw'>('styled');

  const rawText = generateReportText({
    memberName,
    formattedDate,
    tasks,
    achievements,
    pendingWork,
    blockers,
    tomorrowPriorities,
    additionalUpdate
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    if (onCopySuccess) onCopySuccess();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl overflow-hidden sticky top-20">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            LIVE REPORT PREVIEW
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('styled')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors ${
                viewMode === 'styled' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors ${
                viewMode === 'raw' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" /> WhatsApp Text
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
            title="Copy Report to Clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="p-6 max-h-[calc(100vh-180px)] overflow-y-auto">
        {copied && (
          <div className="mb-4 py-2 px-3 bg-emerald-950/80 border border-emerald-700/50 rounded-lg text-emerald-400 text-xs font-semibold flex items-center justify-between animate-fade-in">
            <span>✓ Report copied to clipboard</span>
            <span className="text-[10px] text-emerald-500">Ready for WhatsApp</span>
          </div>
        )}

        {viewMode === 'raw' ? (
          <pre className="font-mono text-xs text-slate-200 bg-slate-950 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed select-all">
            {rawText}
          </pre>
        ) : (
          <div className="font-mono text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap space-y-4">
            <div className="font-bold text-red-500 text-sm tracking-wide">
              🔴 OPSIYS — DAILY EOD REPORT
            </div>

            <div className="text-slate-300 border-b border-slate-800 pb-3">
              <div>📅 Date: <span className="text-white font-semibold">{formattedDate}</span></div>
              <div>👤 Name: <span className="text-white font-semibold">{memberName}</span></div>
            </div>

            <div>
              <div className="font-bold text-slate-100 mb-2">1️⃣ TODAY'S WORK</div>
              {tasks.length === 0 ? (
                <div className="text-slate-400 pl-3">
                  <div>• Task 1: NA</div>
                  <div>NA</div>
                </div>
              ) : (
                <div className="space-y-2 pl-2 border-l border-slate-800">
                  {tasks.map((t, idx) => (
                    <div key={t.id} className="text-slate-300">
                      <div className="font-semibold text-slate-100">• Task {idx + 1}: {t.status}</div>
                      <div className="text-slate-400 pl-3">{t.description.trim() || 'NA'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="font-bold text-slate-100 mb-1">2️⃣ KEY ACHIEVEMENTS / OUTPUT</div>
              <div className="text-slate-300 pl-3">{achievements.trim() || 'NA'}</div>
            </div>

            <div>
              <div className="font-bold text-slate-100 mb-1">3️⃣ PENDING WORK</div>
              {pendingWork.filter(p => p.trim()).length === 0 ? (
                <div className="text-slate-300 pl-3">• NA</div>
              ) : (
                pendingWork.filter(p => p.trim()).map((p, i) => (
                  <div key={i} className="text-slate-300 pl-3">
                    • {p.startsWith('•') ? p.substring(1).trim() : p}
                  </div>
                ))
              )}
            </div>

            <div>
              <div className="font-bold text-slate-100 mb-1">4️⃣ BLOCKERS / ISSUES</div>
              {blockers.filter(b => b.trim()).length === 0 || 
               (blockers.length === 1 && (blockers[0].toLowerCase() === 'no blockers' || blockers[0].toLowerCase() === 'na')) ? (
                <div className="text-slate-300 pl-3">• NA</div>
              ) : (
                blockers.filter(b => b.trim()).map((b, i) => (
                  <div key={i} className="text-slate-300 pl-3">
                    • {b.startsWith('•') ? b.substring(1).trim() : b}
                  </div>
                ))
              )}
            </div>

            <div>
              <div className="font-bold text-slate-100 mb-1">5️⃣ TOMORROW'S PRIORITIES</div>
              {tomorrowPriorities.filter(t => t.trim()).length === 0 ? (
                <div className="text-slate-300 pl-3">• NA</div>
              ) : (
                tomorrowPriorities.filter(t => t.trim()).map((t, i) => (
                  <div key={i} className="text-slate-300 pl-3">
                    • {t.startsWith('•') ? t.substring(1).trim() : t}
                  </div>
                ))
              )}
            </div>

            <div>
              <div className="font-bold text-slate-100 mb-1">6️⃣ ADDITIONAL UPDATE</div>
              <div className="text-slate-300 pl-3">
                {!additionalUpdate.trim() || additionalUpdate.trim() === 'NA' ? 'NA' : `• ${additionalUpdate.trim()}`}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-slate-400">
              <div>━━━━━━━━━━━━━━━━━━</div>
              <div className="text-emerald-400 font-bold mt-1">✅ EOD SUBMITTED</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
