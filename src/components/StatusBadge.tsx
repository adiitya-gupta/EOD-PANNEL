import React from 'react';
import type { TaskStatus, ReportStatus } from '../types/eod';

interface StatusBadgeProps {
  status: TaskStatus | ReportStatus | string;
  type?: 'task' | 'report';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'task' }) => {
  if (type === 'report') {
    if (status === 'submitted' || status === '✅ Submitted') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          ✅ Submitted
        </span>
      );
    }
    if (status === 'pending' || status === '⏳ Pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          ⏳ Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        {status}
      </span>
    );
  }

  switch (status) {
    case '✅ Completed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
          ✅ Completed
        </span>
      );
    case '🔄 In Progress':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          🔄 In Progress
        </span>
      );
    case '⏳ Pending':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
          ⏳ Pending
        </span>
      );
    case '🚫 Blocked':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
          🚫 Blocked
        </span>
      );
    case 'NA':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          NA
        </span>
      );
  }
};
