import React from 'react';
import type { TaskItem } from '../types/eod';
import { TaskBuilder } from './TaskBuilder';
import { Plus, Trash2, CheckSquare } from 'lucide-react';

export interface EODFormData {
  tasks: TaskItem[];
  achievements: string;
  pendingWork: string[];
  blockers: string[];
  tomorrowPriorities: string[];
  additionalUpdate: string;
}

interface EODFormProps {
  formData: EODFormData;
  onChange: (data: EODFormData) => void;
  onSubmitPreview: () => void;
  memberName: string;
  formattedDate: string;
  submitting?: boolean;
}

export const EODForm: React.FC<EODFormProps> = ({
  formData,
  onChange,
  onSubmitPreview,
  memberName,
  formattedDate,
  submitting = false
}) => {

  const handleAddPendingPoint = () => {
    onChange({ ...formData, pendingWork: [...formData.pendingWork, ''] });
  };
  const handleRemovePendingPoint = (index: number) => {
    const list = formData.pendingWork.filter((_, i) => i !== index);
    onChange({ ...formData, pendingWork: list.length ? list : [''] });
  };
  const handlePendingPointChange = (index: number, val: string) => {
    const list = [...formData.pendingWork];
    list[index] = val;
    onChange({ ...formData, pendingWork: list });
  };

  const handleAddBlocker = () => {
    onChange({ ...formData, blockers: [...formData.blockers, ''] });
  };
  const handleRemoveBlocker = (index: number) => {
    const list = formData.blockers.filter((_, i) => i !== index);
    onChange({ ...formData, blockers: list.length ? list : [''] });
  };
  const handleBlockerChange = (index: number, val: string) => {
    const list = [...formData.blockers];
    list[index] = val;
    onChange({ ...formData, blockers: list });
  };
  const handleSetNoBlockers = () => {
    onChange({ ...formData, blockers: ['No blockers'] });
  };

  const handleAddPriority = () => {
    onChange({ ...formData, tomorrowPriorities: [...formData.tomorrowPriorities, ''] });
  };
  const handleRemovePriority = (index: number) => {
    const list = formData.tomorrowPriorities.filter((_, i) => i !== index);
    onChange({ ...formData, tomorrowPriorities: list.length ? list : [''] });
  };
  const handlePriorityChange = (index: number, val: string) => {
    const list = [...formData.tomorrowPriorities];
    list[index] = val;
    onChange({ ...formData, tomorrowPriorities: list });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
          <h2 className="text-lg font-bold tracking-tight">🔴 OPSIYS — DAILY EOD REPORT</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
          <div>📅 Date: <span className="text-white font-semibold">{formattedDate}</span></div>
          <div>👤 Name: <span className="text-white font-semibold">{memberName}</span></div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-wide">
              1️⃣ TODAY'S WORK
            </h3>
            <span className="text-xs font-semibold text-slate-400">Section 1</span>
          </div>
          <TaskBuilder
            tasks={formData.tasks}
            onChange={(tasks) => onChange({ ...formData, tasks })}
          />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-wide">
              2️⃣ KEY ACHIEVEMENTS / OUTPUT
            </h3>
            <span className="text-xs font-semibold text-slate-400">Section 2</span>
          </div>
          <textarea
            rows={3}
            value={formData.achievements}
            onChange={(e) => onChange({ ...formData, achievements: e.target.value })}
            placeholder="Successfully contacted multiple prospects and scheduled meetings (or enter NA)"
            className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-slate-900 placeholder:text-slate-400"
          />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-wide">
              3️⃣ PENDING WORK
            </h3>
            <span className="text-xs font-semibold text-slate-400">Section 3</span>
          </div>

          <div className="space-y-2">
            {formData.pendingWork.map((point, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-slate-400 font-bold text-lg">•</span>
                <input
                  type="text"
                  value={point}
                  onChange={(e) => handlePendingPointChange(idx, e.target.value)}
                  placeholder="Need to talk with proposed Clients (or NA)"
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900"
                />
                {formData.pendingWork.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePendingPoint(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddPendingPoint}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 mt-1"
          >
            <Plus className="w-3.5 h-3.5" /> + Add Point
          </button>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-wide">
              4️⃣ BLOCKERS / ISSUES
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSetNoBlockers}
                className="text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-md transition-colors"
              >
                No blockers
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {formData.blockers.map((blocker, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-slate-400 font-bold text-lg">•</span>
                <input
                  type="text"
                  value={blocker}
                  onChange={(e) => handleBlockerChange(idx, e.target.value)}
                  placeholder="Enter blocker details or NA"
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900"
                />
                {formData.blockers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveBlocker(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddBlocker}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 mt-1"
          >
            <Plus className="w-3.5 h-3.5" /> + Add Blocker
          </button>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-wide">
              5️⃣ TOMORROW'S PRIORITIES
            </h3>
            <span className="text-xs font-semibold text-slate-400">Section 5</span>
          </div>

          <div className="space-y-2">
            {formData.tomorrowPriorities.map((priority, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-slate-400 font-bold text-lg">•</span>
                <input
                  type="text"
                  value={priority}
                  onChange={(e) => handlePriorityChange(idx, e.target.value)}
                  placeholder="Calls and follow up on priority"
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900"
                />
                {formData.tomorrowPriorities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePriority(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddPriority}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 mt-1"
          >
            <Plus className="w-3.5 h-3.5" /> + Add Priority
          </button>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-wide">
              6️⃣ ADDITIONAL UPDATE
            </h3>
            <span className="text-xs font-semibold text-slate-400">Section 6 (Optional)</span>
          </div>
          <textarea
            rows={2}
            value={formData.additionalUpdate}
            onChange={(e) => onChange({ ...formData, additionalUpdate: e.target.value })}
            placeholder="You born as diamond never rush it to be coal. (or leave empty for NA)"
            className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-slate-900 placeholder:text-slate-400"
          />
        </section>

        <div className="pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onSubmitPreview}
            disabled={submitting}
            className="w-full py-3.5 px-6 bg-red-600 hover:bg-red-700 text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CheckSquare className="w-5 h-5" />
            Preview & Submit EOD
          </button>
        </div>

      </div>
    </div>
  );
};
