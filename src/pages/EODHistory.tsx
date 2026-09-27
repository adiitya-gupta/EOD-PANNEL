import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserReports } from '../services/eodService';
import type { EODReport } from '../types/eod';
import { formatTimeOnly } from '../utils/dateFormatters';
import { StatusBadge } from '../components/StatusBadge';
import { History, Clock, Filter, FileText } from 'lucide-react';

export const EODHistory: React.FC = () => {
  const { user } = useAuth();
  
  const [reports, setReports] = useState<EODReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRange, setFilterRange] = useState<'all' | 'week' | 'month' | 'custom'>('all');
  const [customDate, setCustomDate] = useState<string>('');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const userReports = await getUserReports(user.uid);
        setReports(userReports);
      } catch (e) {
        console.error('Error fetching user history:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const getFilteredReports = () => {
    const now = new Date();
    
    return reports.filter((r) => {
      const reportDate = new Date(r.reportDate + 'T00:00:00');

      if (filterRange === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return reportDate >= oneWeekAgo;
      }

      if (filterRange === 'month') {
        return (
          reportDate.getMonth() === now.getMonth() &&
          reportDate.getFullYear() === now.getFullYear()
        );
      }

      if (filterRange === 'custom' && customDate) {
        return r.reportDate === customDate;
      }

      return true;
    });
  };

  const filtered = getFilteredReports();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-red-600" />
            My EOD History
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Review all your past daily EOD report submissions.
          </p>
        </div>

        <div className="text-xs font-semibold bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 shadow-2xs self-start sm:self-auto">
          Total Records: <strong className="text-slate-900">{reports.length}</strong>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Filter Range:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterRange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterRange === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Reports
          </button>

          <button
            onClick={() => setFilterRange('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterRange === 'week'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            This Week
          </button>

          <button
            onClick={() => setFilterRange('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterRange === 'month'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            This Month
          </button>

          <div className="flex items-center gap-1.5 ml-2">
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setFilterRange('custom');
              }}
              className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading history records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-800">Your previous EOD reports will appear here.</p>
            <p className="text-xs text-slate-400">No reports matched your selected filter criteria.</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Tasks</th>
                    <th className="px-6 py-3.5">Submission Status</th>
                    <th className="px-6 py-3.5">Submitted Time</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {r.formattedDate}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                        {r.tasks.length} {r.tasks.length === 1 ? 'Task' : 'Tasks'}
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
                          to={`/eod/${r.id}`}
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

            <div className="md:hidden divide-y divide-slate-100">
              {filtered.map((r) => (
                <div key={r.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{r.formattedDate}</span>
                    <StatusBadge status={r.status} type="report" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{r.tasks.length} Tasks Recorded</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatTimeOnly(r.submittedAt)}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Link
                      to={`/eod/${r.id}`}
                      className="w-full py-2 bg-slate-900 text-white font-bold text-xs rounded-lg text-center block"
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
