import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTodayReportForUser, submitEODReport, updateEODReport } from '../services/eodService';
import { getTasksForMember } from '../services/taskService';
import type { EODReport, TaskStatus } from '../types/eod';
import type { MemberTask } from '../types/task';
import { getTodayDateISO, formatDisplayDate } from '../utils/dateFormatters';
import { EODForm, type EODFormData } from '../components/EODForm';
import { EODPreview } from '../components/EODPreview';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { CheckCircle2, FileText, AlertCircle, Eye, Edit3, CheckSquare } from 'lucide-react';

export const NewEOD: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [existingReport, setExistingReport] = useState<EODReport | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<MemberTask[]>([]);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [formData, setFormData] = useState<EODFormData>({
    tasks: [
      { id: 'task_1', description: '', status: '✅ Completed' }
    ],
    achievements: '',
    pendingWork: [''],
    blockers: ['No blockers'],
    tomorrowPriorities: [''],
    additionalUpdate: ''
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

  const todayISO = getTodayDateISO();
  const formattedDate = formatDisplayDate(todayISO);
  const memberName = user?.name || 'Team Member';

  const populateFormForEditing = (report: EODReport) => {
    setFormData({
      tasks: report.tasks?.length ? report.tasks : [{ id: 'task_1', description: '', status: '✅ Completed' }],
      achievements: report.keyAchievements || report.achievements || '',
      pendingWork: report.pendingWork?.length ? report.pendingWork : [''],
      blockers: report.blockers?.length ? report.blockers : ['No blockers'],
      tomorrowPriorities: report.tomorrowPriorities?.length ? report.tomorrowPriorities : [''],
      additionalUpdate: report.additionalUpdate || ''
    });
    setIsEditMode(true);
  };

  useEffect(() => {
    const initData = async () => {
      if (!user) return;
      setCheckingExisting(true);
      try {
        const report = await getTodayReportForUser(user.uid, todayISO);
        setExistingReport(report);

        const tasks = await getTasksForMember(user.uid);
        setAssignedTasks(tasks);

        const searchParams = new URLSearchParams(location.search);
        const shouldEdit = searchParams.get('edit') === 'true';

        if (report) {
          if (shouldEdit) {
            populateFormForEditing(report);
          }
        } else if (tasks.length > 0) {
          // Pre-populate Section 1 from assigned tasks if initial tasks are empty
          const autoTasks = tasks.map((t, idx) => {
            let initialStatus: TaskStatus = '✅ Completed';
            if (t.status === 'in-progress') initialStatus = '🔄 In Progress';
            if (t.status === 'pending') initialStatus = '⏳ Pending';
            if (t.status === 'completed') initialStatus = '✅ Completed';

            return {
              id: 'assigned_' + idx + '_' + t.id,
              description: t.title + (t.description ? ` (${t.description})` : ''),
              status: initialStatus
            };
          });

          setFormData(prev => ({
            ...prev,
            tasks: autoTasks
          }));
        }
      } catch (e) {
        console.error('Check duplicate report error:', e);
      } finally {
        setCheckingExisting(false);
      }
    };

    initData();
  }, [user, todayISO, location.search]);

  const handleValidation = (): boolean => {
    setValidationError(null);

    if (!formData.tasks || formData.tasks.length === 0) {
      setValidationError('Please add at least one task in TODAY\'S WORK.');
      return false;
    }

    const emptyTask = formData.tasks.find(t => !t.description.trim());
    if (emptyTask) {
      setValidationError('All task descriptions in TODAY\'S WORK must be filled.');
      return false;
    }

    return true;
  };

  const handleOpenConfirmation = () => {
    if (handleValidation()) {
      setIsModalOpen(true);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (isEditMode && existingReport) {
        await updateEODReport(existingReport.id, {
          tasks: formData.tasks,
          achievements: formData.achievements,
          pendingWork: formData.pendingWork.filter(p => p.trim()),
          blockers: formData.blockers.filter(b => b.trim()),
          tomorrowPriorities: formData.tomorrowPriorities.filter(t => t.trim()),
          additionalUpdate: formData.additionalUpdate
        });

        setIsModalOpen(false);
        navigate(`/eod/${existingReport.id}`);
      } else {
        const submittedReport = await submitEODReport({
          userId: user.uid,
          memberName,
          memberEmail: user.email,
          reportDate: todayISO,
          tasks: formData.tasks,
          achievements: formData.achievements,
          pendingWork: formData.pendingWork.filter(p => p.trim()),
          blockers: formData.blockers.filter(b => b.trim()),
          tomorrowPriorities: formData.tomorrowPriorities.filter(t => t.trim()),
          additionalUpdate: formData.additionalUpdate
        });

        setIsModalOpen(false);
        navigate(`/eod/${submittedReport.id}`);
      }
    } catch (err: any) {
      setValidationError(err.message || 'Failed to submit report. Please try again.');
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportAssignedTask = (task: MemberTask) => {
    let initialStatus: TaskStatus = '✅ Completed';
    if (task.status === 'in-progress') initialStatus = '🔄 In Progress';
    if (task.status === 'pending') initialStatus = '⏳ Pending';
    if (task.status === 'completed') initialStatus = '✅ Completed';

    const newTaskItem = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      description: task.title + (task.description ? ` - ${task.description}` : ''),
      status: initialStatus
    };

    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTaskItem]
    }));
  };

  if (checkingExisting) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Checking EOD Submission Status...</p>
        </div>
      </div>
    );
  }

  if (existingReport && !isEditMode) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Today's EOD has already been submitted.
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            You recorded your official EOD report for today ({formattedDate}). You can edit your submitted report or view the full report below.
          </p>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => populateFormForEditing(existingReport)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            Edit Today's EOD Report
          </button>

          <Link
            to={`/eod/${existingReport.id}`}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm shadow-sm transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-red-500" />
            View Today's EOD
          </Link>

          <Link
            to="/dashboard"
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-sm transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Fill Today's EOD Report
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Complete the official 6 sections. Live preview updates automatically.
          </p>
        </div>

        <div className="lg:hidden flex bg-slate-200 p-1 rounded-xl">
          <button
            onClick={() => setMobileTab('form')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${
              mobileTab === 'form' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Form
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${
              mobileTab === 'preview' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Live Preview
          </button>
        </div>
      </div>

      {/* Selectable Assigned Tasks Quick-Add Banner */}
      {assignedTasks.length > 0 && (
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Quick Add Assigned Tasks to Today's Work:
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {assignedTasks.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleImportAssignedTask(t)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-red-600/30 border border-slate-700 hover:border-red-500 text-xs font-semibold rounded-lg text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>+</span> {t.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {validationError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className={mobileTab === 'form' ? 'block' : 'hidden lg:block'}>
          <EODForm
            formData={formData}
            onChange={setFormData}
            onSubmitPreview={handleOpenConfirmation}
            memberName={memberName}
            formattedDate={formattedDate}
            submitting={isSubmitting}
            isEditMode={isEditMode}
          />
        </div>

        <div className={mobileTab === 'preview' ? 'block' : 'hidden lg:block'}>
          <EODPreview
            memberName={memberName}
            formattedDate={formattedDate}
            tasks={formData.tasks}
            achievements={formData.achievements}
            pendingWork={formData.pendingWork}
            blockers={formData.blockers}
            tomorrowPriorities={formData.tomorrowPriorities}
            additionalUpdate={formData.additionalUpdate}
          />
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
