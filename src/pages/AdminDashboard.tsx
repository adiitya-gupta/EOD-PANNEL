import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminTeamStats, getAllTeamReports } from '../services/eodService';
import type { AdminTeamStats, EODReport } from '../types/eod';
import { getTodayDateISO, formatDisplayDate, formatTimeOnly } from '../utils/dateFormatters';
import { StatsCard } from '../components/StatsCard';
import { StatusBadge } from '../components/StatusBadge';
import { 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  ArrowRight, 
  FileText 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminTeamStats | null>(null);
  const [recentReports, setRecentReports] = useState<EODReport[]>([]);
  const [loading, setLoading] = useState(true);

  const todayISO = getTodayDateISO();
  const formattedToday = formatDisplayDate(todayISO);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const teamStats = await getAdminTeamStats();
        setStats(teamStats);

        const allReports = await getAllTeamReports();
        setRecentReports(allReports.slice(0, 6));
      } catch (e) {
        console.error('Error fetching admin dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-600/30 text-red-400 border border-red-500/30">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            OPSIYS Management Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Team EOD Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor real-time team compliance and daily reports.
          </p>
        </div>

        <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 self-start sm:self-auto">
          📅 Today: <span className="text-white font-bold">{formattedToday}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Team Members"
          value={`${stats?.totalMembers ?? 0} Members`}
          subtitle="Total active team"
          icon={Users}
          accentColor="slate"
        />
        <StatsCard
          title="Submitted Today"
          value={`${stats?.submittedCount ?? 0} Submitted`}
          subtitle="Recorded today"
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <StatsCard
          title="Pending Today"
          value={`${stats?.pendingCount ?? 0} Pending`}
          subtitle="Awaiting submission"
          icon={Clock}
          accentColor="amber"
        />
        <StatsCard
          title="Submission Rate"
          value={`${stats?.submissionRate ?? 0}%`}
          subtitle="Today's compliance rate"
          icon={BarChart3}
          accentColor="red"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Latest Team Submissions</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time submitted reports across the organization</p>
          </div>

          <Link
            to="/admin/reports"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            Manage All Team Reports <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading admin data...</div>
        ) : recentReports.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-800">No team reports found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Team Member</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Submitted At</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {r.memberName}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {r.formattedDate}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={r.status} type="report" />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 flex items-center gap-1.5 pt-5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatTimeOnly(r.submittedAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/reports/${r.id}`}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        View Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
