import React, { useState } from 'react';
import type { EODReport } from '../types/eod';
import { generateEODReportTextFromObj } from '../utils/textGenerator';
import { formatTimeOnly } from '../utils/dateFormatters';
import { StatusBadge } from './StatusBadge';
import { Copy, Check, Calendar, User, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EODReportCardProps {
  report: EODReport;
  backPath?: string;
  backText?: string;
}

export const EODReportCard: React.FC<EODReportCardProps> = ({
  report,
  backPath = '/dashboard',
  backText = 'Back to Dashboard'
}) => {
  const [copied, setCopied] = useState(false);

  const rawText = generateEODReportTextFromObj(report);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to={backPath}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {backText}
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Copied to Clipboard
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                📋 Copy Report
              </>
            )}
          </button>
        </div>
      </div>

      {copied && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between animate-fade-in shadow-xs">
          <span>✓ Report copied to clipboard in WhatsApp-friendly format</span>
          <span className="text-xs text-emerald-600">Ready to paste</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        
        <div className="bg-slate-900 text-white p-6 sm:p-8 border-b border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-pulse"></span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight font-mono">
                🔴 OPSIYS — DAILY EOD REPORT
              </h1>
            </div>
            <StatusBadge status={report.status} type="report" />
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-slate-300 bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-400" />
              <span>Date: <strong className="text-white">{report.formattedDate}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-red-400" />
              <span>Name: <strong className="text-white">{report.memberName}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-400" />
              <span>Submitted: <strong className="text-white">{formatTimeOnly(report.submittedAt)}</strong></span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8 font-mono text-sm text-slate-800 leading-relaxed">
          
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-2">
              1️⃣ TODAY'S WORK
            </h3>
            <div className="space-y-3 pl-2">
              {report.tasks.map((task, idx) => (
                <div key={task.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>• Task {idx + 1}:</span>
                    <StatusBadge status={task.status} type="task" />
                  </div>
                  <p className="text-slate-700 mt-1 pl-3 whitespace-pre-wrap">{task.description || 'NA'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-2">
              2️⃣ KEY ACHIEVEMENTS / OUTPUT
            </h3>
            <p className="text-slate-700 pl-3 whitespace-pre-wrap">{report.achievements?.trim() || 'NA'}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-2">
              3️⃣ PENDING WORK
            </h3>
            {report.pendingWork?.length === 0 || (report.pendingWork?.length === 1 && !report.pendingWork[0]?.trim()) ? (
              <p className="text-slate-700 pl-3">• NA</p>
            ) : (
              <ul className="space-y-1 pl-3">
                {report.pendingWork?.map((item, i) => (
                  <li key={i} className="text-slate-700">
                    • {item.startsWith('•') ? item.substring(1).trim() : item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-2">
              4️⃣ BLOCKERS / ISSUES
            </h3>
            {report.blockers?.length === 0 || (report.blockers?.length === 1 && (!report.blockers[0]?.trim() || report.blockers[0]?.toLowerCase() === 'no blockers' || report.blockers[0]?.toLowerCase() === 'na')) ? (
              <p className="text-slate-700 pl-3">• NA</p>
            ) : (
              <ul className="space-y-1 pl-3">
                {report.blockers?.map((item, i) => (
                  <li key={i} className="text-slate-700">
                    • {item.startsWith('•') ? item.substring(1).trim() : item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-2">
              5️⃣ TOMORROW'S PRIORITIES
            </h3>
            {report.tomorrowPriorities?.length === 0 || (report.tomorrowPriorities?.length === 1 && !report.tomorrowPriorities[0]?.trim()) ? (
              <p className="text-slate-700 pl-3">• NA</p>
            ) : (
              <ul className="space-y-1 pl-3">
                {report.tomorrowPriorities?.map((item, i) => (
                  <li key={i} className="text-slate-700">
                    • {item.startsWith('•') ? item.substring(1).trim() : item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-2">
              6️⃣ ADDITIONAL UPDATE
            </h3>
            <p className="text-slate-700 pl-3">
              {!report.additionalUpdate?.trim() || report.additionalUpdate?.trim() === 'NA' ? 'NA' : `• ${report.additionalUpdate.trim()}`}
            </p>
          </div>

          <div className="pt-6 border-t border-slate-200 space-y-2">
            <div className="text-slate-400 font-bold">━━━━━━━━━━━━━━━━━━</div>
            <div className="text-emerald-700 font-bold text-base flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              ✅ EOD SUBMITTED
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
