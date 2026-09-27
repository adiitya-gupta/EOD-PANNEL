import React, { useEffect, useState } from 'react';
import { getAllTeamReports, getAdminTeamStats } from '../services/eodService';
import { getAllUsersService } from '../services/auth';
import type { AdminTeamStats, EODReport } from '../types/eod';
import type { UserProfile } from '../types/auth';
import { StatsCard } from '../components/StatsCard';
import { BarChart3, TrendingUp, Calendar, CheckCircle2, FileText } from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const [stats, setStats] = useState<AdminTeamStats | null>(null);
  const [reports, setReports] = useState<EODReport[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const teamStats = await getAdminTeamStats();
        setStats(teamStats);

        const allReports = await getAllTeamReports();
        setReports(allReports);

        const usersList = await getAllUsersService();
        setMembers(usersList.filter(u => u.role === 'member'));
      } catch (e) {
        console.error('Analytics load error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-red-600" />
          EOD & Reporting Analytics
        </h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          High-level overview of reporting activity and submission consistency.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Reports"
          value={reports.length}
          subtitle="Lifetime EOD submissions"
          icon={FileText}
          accentColor="red"
        />
        <StatsCard
          title="Reports This Month"
          value={stats?.reportsThisMonth ?? 0}
          subtitle="Current month activity"
          icon={Calendar}
          accentColor="slate"
        />
        <StatsCard
          title="Today's Submissions"
          value={`${stats?.submittedCount ?? 0} / ${stats?.totalMembers ?? 0}`}
          subtitle="Team members reported"
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <StatsCard
          title="Team Compliance Rate"
          value={`${stats?.submissionRate ?? 0}%`}
          subtitle="Overall submission rate"
          icon={TrendingUp}
          accentColor="amber"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Member Submission Compliance</h2>
          <p className="text-xs text-slate-500 mt-0.5">Submission consistency per team member</p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading analytics data...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No active team members found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Member</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Total Reports</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => {
                  const mReportsCount = reports.filter(r => r.userId === m.uid).length;
                  return (
                    <tr key={m.uid} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{m.name}</div>
                        <div className="text-[11px] text-slate-400">{m.email}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">
                        {m.role}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {mReportsCount} Reports
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={`/admin/team/${m.uid}`}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors inline-block"
                        >
                          View Member Profile
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
