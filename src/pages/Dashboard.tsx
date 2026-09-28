import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscribeToTodayEOD, getUserReports, getMemberStats } from '../services/eodService';
import { subscribeToMemberTasks, updateTaskStatus } from '../services/taskService';
import type { EODReport, EODStats } from '../types/eod';
import type { MemberTask, MemberTaskStatus } from '../types/task';
import { formatDisplayDate, formatTimeOnly, getTodayDateISO } from '../utils/dateFormatters';
import { generateEODReportTextFromObj } from '../utils/textGenerator';
import { StatusBadge } from '../components/StatusBadge';
import { StatsCard } from '../components/StatsCard';
import { 
  AlertCircle, 
  CheckCircle2, 
  PlusCircle, 
  FileText, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  ChevronRight,
  CheckSquare,
  Flame,
  ListTodo,
  TrendingUp,
  Zap,
  Edit3
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  const [todayReport, setTodayReport] = useState<EODReport | null>(null);
  const [reports, setReports] = useState<EODReport[]>([]);
  const [tasks, setTasks] = useState<MemberTask[]>([]);
  const [stats, setStats] = useState<EODStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const todayISO = getTodayDateISO();
  const formattedToday = formatDisplayDate(todayISO);
  const todayDayName = new Date().toLocaleDateString('en-IN', { weekday: 'long' });

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // 1. Real-time today's EOD listener
    const unsubscribeEOD = subscribeToTodayEOD(user.uid, (report) => {
      setTodayReport(report);
    });

    // 2. Real-time tasks listener
    const unsubscribeTasks = subscribeToMemberTasks(user.uid, (taskList) => {
      setTasks(taskList);
    });

    // 3. Fetch user history and stats
    const fetchHistoryAndStats = async () => {
      try {
        const userHistory = await getUserReports(user.uid);
        setReports(userHistory);

        const memberStats = await getMemberStats(user.uid);
        setStats(memberStats);
      } catch (e) {
        console.error('Error loading dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryAndStats();

    return () => {
      unsubscribeEOD();
      unsubscribeTasks();
    };
  }, [user]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleCopyTodayReport = () => {
    if (!todayReport) return;
    const text = generateEODReportTextFromObj(todayReport);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTaskStatusToggle = async (taskId: string, currentStatus: MemberTaskStatus) => {
    const nextStatusMap: Record<MemberTaskStatus, MemberTaskStatus> = {
      'pending': 'in-progress',
      'in-progress': 'completed',
      'completed': 'pending'
    };
    const nextStatus = nextStatusMap[currentStatus];
    try {
      await updateTaskStatus(taskId, nextStatus);
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* SECTION A: Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
            {getTimeGreeting()}, {user?.name || 'Team Member'}
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">
            OPSIYS Personal Member Workspace
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold">
            <Calendar className="w-4 h-4 text-red-600" />
            <span>{todayDayName}, {formattedToday}</span>
          </div>
        </div>
      </div>

      {/* SECTION B: Today's Assigned Tasks */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-slate-900">Today's Tasks</h2>
          </div>
          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
            {tasks.filter(t => t.status === 'completed').length} / {tasks.length} Completed
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-10 text-center text-slate-500 space-y-2">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-1" />
            <p className="font-semibold text-slate-700 text-sm">No tasks assigned for today.</p>
            <p className="text-xs text-slate-400">Your assigned tasks from management will appear here automatically.</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task, idx) => (
              <div
                key={task.id}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      0{idx + 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {task.priority} Priority
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{task.title}</h3>
                  {task.description && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{task.description}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Status:
                  </span>

                  <button
                    type="button"
                    onClick={() => handleTaskStatusToggle(task.id, task.status)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      task.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {task.status === 'in-progress' && <Zap className="w-3.5 h-3.5 text-blue-600 animate-pulse" />}
                    {task.status === 'pending' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                    <span className="capitalize">{task.status.replace('-', ' ')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION C: Today's EOD Status Banner */}
      {loading ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : todayReport ? (
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-emerald-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
                ✓ EOD Submitted
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Your EOD report has been recorded for today.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Submitted at {formatTimeOnly(todayReport.submittedAt)} ({formattedToday}).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/eod/new?edit=true"
                className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow-xs transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit Report
              </Link>

              <Link
                to={`/eod/${todayReport.id}`}
                className="px-5 py-3 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl text-sm shadow-xs transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-red-600" />
                View Report
              </Link>

              <button
                onClick={handleCopyTodayReport}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                {copied ? '✓ Copied' : 'Copy Report'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-red-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-red-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertCircle className="w-4 h-4" />
                EOD STATUS — Not submitted yet
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Submit your daily EOD report before wrapping up.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Record your achievements, progress, and tomorrow's priorities.
              </p>
            </div>

            <Link
              to="/eod/new"
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <PlusCircle className="w-5 h-5" />
              Submit Today's EOD
            </Link>
          </div>
        </div>
      )}

      {/* SECTION D: EOD Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total EOD Reports"
          value={stats?.totalSubmitted ?? 0}
          subtitle="Recorded lifetime EODs"
          icon={FileText}
          accentColor="red"
        />
        <StatsCard
          title="This Month"
          value={`${stats?.workingDaysThisMonth ?? 22} Working Days`}
          subtitle="Current month working days"
          icon={Calendar}
          accentColor="slate"
        />
        <StatsCard
          title="Current Streak"
          value={`${stats?.currentStreak ?? 0} Days`}
          subtitle="Consecutive daily reports"
          icon={Flame}
          accentColor="amber"
        />
        <StatsCard
          title="Submission Rate"
          value={`${stats?.submissionRate ?? 0}%`}
          subtitle="Monthly compliance rate"
          icon={TrendingUp}
          accentColor="emerald"
        />
      </div>

      {/* SECTION E: Recent EOD History (Logged-in User Only) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent EOD History</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your personal submitted reports</p>
          </div>

          <Link
            to="/eod/history"
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            View All History <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No EOD submitted yet.</p>
            <p className="text-xs text-slate-400 mt-1">Your submitted EOD reports will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.slice(0, 5).map((r) => (
              <div key={r.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">{r.formattedDate}</span>
                    <StatusBadge status={r.status} type="report" />
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    Achievements: {r.achievements || 'Recorded'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-block text-xs text-slate-400">
                    {formatTimeOnly(r.submittedAt)}
                  </span>
                  <Link
                    to={`/eod/${r.id}`}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors"
                  >
                    View Report
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
