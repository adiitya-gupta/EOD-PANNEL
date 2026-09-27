import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAllUsersService } from '../services/auth';
import { getUserReports, getMemberStats } from '../services/eodService';
import { getTasksForMember } from '../services/taskService';
import type { UserProfile } from '../types/auth';
import type { EODReport, EODStats } from '../types/eod';
import type { MemberTask } from '../types/task';
import { StatusBadge } from '../components/StatusBadge';
import { User, ArrowLeft } from 'lucide-react';

export const AdminMemberProfile: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();

  const [member, setMember] = useState<UserProfile | null>(null);
  const [reports, setReports] = useState<EODReport[]>([]);
  const [tasks, setTasks] = useState<MemberTask[]>([]);
  const [stats, setStats] = useState<EODStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TASKS' | 'EOD HISTORY'>('OVERVIEW');

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!uid) return;
      setLoading(true);
      try {
        const usersList = await getAllUsersService();
        const foundUser = usersList.find(u => u.uid === uid);
        setMember(foundUser || null);

        const memberReports = await getUserReports(uid);
        setReports(memberReports);

        const memberTasks = await getTasksForMember(uid);
        setTasks(memberTasks);

        const memberStats = await getMemberStats(uid);
        setStats(memberStats);
      } catch (e) {
        console.error('Error fetching member profile:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [uid]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading Member Profile...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <User className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Member Not Found</h2>
        <Link to="/admin/reports" className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl inline-block">
          Return to Team List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <Link
        to="/admin/reports"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Team Reports
      </Link>

      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-red-500 font-bold text-2xl uppercase">
              {member.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase">{member.name}</h1>
              <p className="text-xs text-slate-400 font-medium">{member.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-red-400 border border-slate-700">
                  Role: {member.role}
                </span>
                {member.department && (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                    {member.department}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Total EOD</p>
              <p className="text-xl font-bold text-white">{stats?.totalSubmitted ?? 0}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">This Month</p>
              <p className="text-xl font-bold text-emerald-400">{reports.length}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Assigned Tasks</p>
              <p className="text-xl font-bold text-amber-400">{tasks.length}</p>
            </div>
          </div>
        </div>

        <div className="flex border-b border-slate-800 gap-6 pt-2">
          {(['OVERVIEW', 'TASKS', 'EOD HISTORY'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-bold tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === tab
                  ? 'text-red-500 border-red-500'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Recent Submissions</h3>
            <div className="space-y-3">
              {reports.slice(0, 4).map((r) => (
                <div key={r.id} className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-900">{r.formattedDate}</span>
                  <StatusBadge status={r.status} type="report" />
                  <Link to={`/admin/reports/${r.id}`} className="text-red-600 font-bold hover:underline">
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Active Assigned Tasks</h3>
            <div className="space-y-3">
              {tasks.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-900">{t.title}</span>
                  <span className="capitalize px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-bold">
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'TASKS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">All Assigned Tasks ({tasks.length})</h3>
          {tasks.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No tasks currently assigned to {member.name}.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {tasks.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{t.title}</p>
                    <p className="text-xs text-slate-500">{t.description || 'No description'}</p>
                  </div>
                  <span className="capitalize px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'EOD HISTORY' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Full EOD History ({reports.length})</h3>
          {reports.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No EOD reports submitted yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((r) => (
                <div key={r.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{r.formattedDate}</p>
                    <p className="text-xs text-slate-500">{r.tasks.length} Tasks Recorded</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={r.status} type="report" />
                    <Link to={`/admin/reports/${r.id}`} className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg">
                      Open Report
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
