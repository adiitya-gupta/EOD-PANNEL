import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllUsersService } from '../services/auth';
import { createMemberTask, getAllTasksAdmin, updateTaskStatus, deleteMemberTask } from '../services/taskService';
import type { MemberTask, MemberTaskStatus, TaskPriority } from '../types/task';
import type { UserProfile } from '../types/auth';
import { ListTodo, Plus, Trash2, AlertCircle } from 'lucide-react';

export const AdminTasks: React.FC = () => {
  const { user } = useAuth();
  
  const [tasks, setTasks] = useState<MemberTask[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemberUid, setSelectedMemberUid] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status] = useState<MemberTaskStatus>('pending');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const allTasks = await getAllTasksAdmin();
      setTasks(allTasks);

      const usersList = await getAllUsersService();
      const memberUsers = usersList.filter(u => u.role === 'member');
      setMembers(memberUsers);
      if (memberUsers.length > 0) {
        setSelectedMemberUid(memberUsers[0].uid);
      }
    } catch (e) {
      console.error('Error loading admin tasks:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedMemberUid || !user) {
      setError('Please provide a task title and select a team member.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const assignedUser = members.find(m => m.uid === selectedMemberUid);
      
      await createMemberTask({
        assignedTo: selectedMemberUid,
        assignedToName: assignedUser?.name || 'Member',
        assignedBy: user.uid,
        assignedByName: user.name,
        title,
        description,
        priority,
        status,
        dueDate
      });

      setTitle('');
      setDescription('');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to assign task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: MemberTaskStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      fetchData();
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteMemberTask(taskId);
      fetchData();
    } catch (e) {
      console.error('Failed to delete task:', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-red-600" />
            Task Management
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Assign, manage, and monitor tasks across team members.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Assign New Task
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <ListTodo className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-800">No tasks assigned yet.</p>
            <p className="text-xs text-slate-400">Click "Assign New Task" to create tasks for your team.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Task Title</th>
                  <th className="px-6 py-3.5">Assigned To</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{task.title}</div>
                      {task.description && (
                        <div className="text-xs text-slate-500 truncate max-w-xs">{task.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {task.assignedToName || 'Member'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600">
                      {task.dueDate || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as MemberTaskStatus)}
                        className="px-2.5 py-1 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="in-progress">⚡ In Progress</option>
                        <option value="completed">✅ Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Assign Task to Team Member
            </h3>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Assign To <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedMemberUid}
                  onChange={(e) => setSelectedMemberUid(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  required
                >
                  {members.map((m) => (
                    <option key={m.uid} value={m.uid}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Prepare Client Outreach Campaign"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional details or context"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 text-xs font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  SAVE TASK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
