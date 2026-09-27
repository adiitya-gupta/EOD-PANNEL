import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllTeamReports } from '../services/eodService';
import { getAllUsersService } from '../services/auth';
import type { EODReport } from '../types/eod';
import type { UserProfile } from '../types/auth';
import { getTodayDateISO, formatTimeOnly } from '../utils/dateFormatters';
import { StatusBadge } from '../components/StatusBadge';
import { Users, Filter, Clock, FileText, Search } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<EODReport[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'>('all');
  const [customDate, setCustomDate] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const todayISO = getTodayDateISO();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const teamReports = await getAllTeamReports();
        setReports(teamReports);

        const usersList = await getAllUsersService();
        setMembers(usersList.filter(u => u.role === 'member'));
      } catch (e) {
        console.error('Error fetching admin reports:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFilteredReports = () => {
    const now = new Date();

    return reports.filter((r) => {
      if (selectedMember !== 'all' && r.userId !== selectedMember) {
        return false;
      }

      if (selectedStatus !== 'all' && r.status !== selectedStatus) {
        return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = r.memberName.toLowerCase().includes(query);
        const matchesDate = r.formattedDate.toLowerCase().includes(query);
        if (!matchesName && !matchesDate) return false;
      }

      if (dateFilter === 'today') {
        return r.reportDate === todayISO;
      }

      if (dateFilter === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const yISO = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        return r.reportDate === yISO;
      }

      if (dateFilter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        const reportDate = new Date(r.reportDate + 'T00:00:00');
        return reportDate >= oneWeekAgo;
      }

      if (dateFilter === 'month') {
        const reportDate = new Date(r.reportDate + 'T00:00:00');
        return (
          reportDate.getMonth() === now.getMonth() &&
          reportDate.getFullYear() === now.getFullYear()
        );
      }

      if (dateFilter === 'custom' && customDate) {
        return r.reportDate === customDate;
      }

      return true;
    });
  };

  const filteredReports = getFilteredReports();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-red-600" />
            Team EOD Reports
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Browse and inspect all submissions across team members.
          </p>
        </div>

        <div className="text-xs font-semibold bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 shadow-2xs self-start sm:self-auto">
          Filtered Results: <strong className="text-slate-900">{filteredReports.length}</strong>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Admin Filter Controls
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Search Member / Date
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Aditya..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Team Member
            </label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              <option value="all">All Team Members</option>
              {members.map((m) => (
                <option key={m.uid} value={m.uid}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Date Period
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Specific Date</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Submission Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">✅ Submitted</option>
              <option value="pending">⏳ Pending</option>
              <option value="late">Late</option>
            </select>
          </div>
        </div>

        {dateFilter === 'custom' && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Select Date:</span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading team reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-800">No reports found for the selected filters.</p>
            <p className="text-xs text-slate-400">Try adjusting your date or member filter selections.</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Member</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Submitted At</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{r.memberName}</div>
                        <div className="text-[11px] text-slate-400">{r.memberEmail}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {r.formattedDate}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={r.status} type="report" />
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 flex items-center gap-1.5 pt-6">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatTimeOnly(r.submittedAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/admin/reports/${r.id}`}
                          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          View Report
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-slate-100">
              {filteredReports.map((r) => (
                <div key={r.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{r.memberName}</p>
                      <p className="text-xs text-slate-500">{r.formattedDate}</p>
                    </div>
                    <StatusBadge status={r.status} type="report" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatTimeOnly(r.submittedAt)}
                    </span>
                    <Link
                      to={`/admin/reports/${r.id}`}
                      className="px-3 py-1 bg-red-600 text-white font-bold text-xs rounded-md"
                    >
                      View Report
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
