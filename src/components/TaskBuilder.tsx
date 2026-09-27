import React from 'react';
import type { TaskItem, TaskStatus } from '../types/eod';
import { Plus, Trash2 } from 'lucide-react';

interface TaskBuilderProps {
  tasks: TaskItem[];
  onChange: (tasks: TaskItem[]) => void;
}

const STATUS_OPTIONS: TaskStatus[] = [
  '✅ Completed',
  '🔄 In Progress',
  '⏳ Pending',
  '🚫 Blocked',
  'NA'
];

export const TaskBuilder: React.FC<TaskBuilderProps> = ({ tasks, onChange }) => {

  const handleAddTask = () => {
    const newTask: TaskItem = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      description: '',
      status: '✅ Completed'
    };
    onChange([...tasks, newTask]);
  };

  const handleRemoveTask = (id: string) => {
    if (tasks.length <= 1) return;
    onChange(tasks.filter(t => t.id !== id));
  };

  const handleTaskChange = (id: string, field: 'description' | 'status', value: string) => {
    onChange(
      tasks.map(t => {
        if (t.id === id) {
          return { ...t, [field]: value as any };
        }
        return t;
      })
    );
  };

  return (
    <div className="space-y-4">
      {tasks.map((task, index) => (
        <div key={task.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                {index + 1}
              </span>
              Task {index + 1}
            </span>

            {tasks.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveTask(task.id)}
                className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                title="Remove task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-500 uppercase mb-1">
                Task Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={task.description}
                onChange={(e) => handleTaskChange(task.id, 'description', e.target.value)}
                placeholder="e.g. Clients outreach and calls"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={task.status}
                onChange={(e) => handleTaskChange(task.id, 'status', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-slate-900 font-medium cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddTask}
        className="w-full py-2.5 px-4 border border-dashed border-red-300 rounded-xl text-red-600 hover:bg-red-50 hover:border-red-400 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        <Plus className="w-4 h-4" />
        + Add Task
      </button>
    </div>
  );
};
