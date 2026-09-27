import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReportById, getAllTeamReports } from '../services/eodService';
import type { EODReport } from '../types/eod';
import { EODReportCard } from '../components/EODReportCard';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export const AdminReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<EODReport | null>(null);
  const [allReports, setAllReports] = useState<EODReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportAndList = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const found = await getReportById(id);
        setReport(found);

        const teamReports = await getAllTeamReports();
        setAllReports(teamReports);
      } catch (e) {
        console.error('Error loading report for admin:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchReportAndList();
  }, [id]);

  const currentIndex = allReports.findIndex(r => r.id === id);
  const prevReport = currentIndex > 0 ? allReports[currentIndex - 1] : null;
  const nextReport = currentIndex >= 0 && currentIndex < allReports.length - 1 ? allReports[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading Member EOD Report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Report Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested member report could not be found.
        </p>
        <button
          onClick={() => navigate('/admin/reports')}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
        >
          Return to Admin Reports
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Admin Prev/Next Navigation Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => prevReport && navigate(`/admin/reports/${prevReport.id}`)}
          disabled={!prevReport}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl disabled:opacity-40 flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Previous Report
        </button>

        <span className="text-xs text-slate-500 font-medium">
          Report {currentIndex + 1} of {allReports.length}
        </span>

        <button
          onClick={() => nextReport && navigate(`/admin/reports/${nextReport.id}`)}
          disabled={!nextReport}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl disabled:opacity-40 flex items-center gap-1 cursor-pointer"
        >
          Next Report <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <EODReportCard
        report={report}
        backPath="/admin/reports"
        backText="← Back to Team Reports"
      />
    </div>
  );
};
