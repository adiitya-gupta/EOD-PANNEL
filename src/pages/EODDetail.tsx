import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReportById } from '../services/eodService';
import type { EODReport } from '../types/eod';
import { EODReportCard } from '../components/EODReportCard';
import { AlertCircle } from 'lucide-react';

export const EODDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<EODReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const found = await getReportById(id);
        setReport(found);
      } catch (e) {
        console.error('Error loading report:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Retrieving EOD Report...</p>
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
          The requested EOD report could not be found or you do not have permission to view it.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <EODReportCard report={report} backPath="/dashboard" backText="← Back to Dashboard" />
    </div>
  );
};
