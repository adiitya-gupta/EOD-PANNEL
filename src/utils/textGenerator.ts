import type { EODReport, TaskItem } from '../types/eod';

export const generateReportText = (data: {
  memberName: string;
  formattedDate: string;
  tasks: TaskItem[];
  achievements: string;
  pendingWork: string[];
  blockers: string[];
  tomorrowPriorities: string[];
  additionalUpdate: string;
}): string => {
  const lines: string[] = [];

  lines.push('🔴 OPSIYS — DAILY EOD REPORT');
  lines.push('');
  lines.push(`📅 Date: ${data.formattedDate}`);
  lines.push(`👤 Name: ${data.memberName}`);
  lines.push('');
  lines.push("1️⃣ TODAY'S WORK");
  lines.push('');

  if (data.tasks.length === 0) {
    lines.push('• Task 1: NA');
    lines.push('NA');
  } else {
    data.tasks.forEach((task, index) => {
      lines.push(`• Task ${index + 1}: ${task.status}`);
      lines.push(task.description.trim() || 'NA');
      if (index < data.tasks.length - 1) {
        lines.push('');
      }
    });
  }

  lines.push('');
  lines.push('2️⃣ KEY ACHIEVEMENTS / OUTPUT');
  lines.push('');
  lines.push(data.achievements.trim() || 'NA');

  lines.push('');
  lines.push('3️⃣ PENDING WORK');
  lines.push('');
  if (data.pendingWork.length === 0 || (data.pendingWork.length === 1 && !data.pendingWork[0].trim())) {
    lines.push('• NA');
  } else {
    data.pendingWork.forEach((item) => {
      const trimmed = item.trim();
      if (trimmed) {
        lines.push(`• ${trimmed.startsWith('•') ? trimmed.substring(1).trim() : trimmed}`);
      }
    });
  }

  lines.push('');
  lines.push('4️⃣ BLOCKERS / ISSUES');
  lines.push('');
  if (data.blockers.length === 0 || (data.blockers.length === 1 && (!data.blockers[0].trim() || data.blockers[0].trim().toLowerCase() === 'no blockers' || data.blockers[0].trim().toLowerCase() === 'na'))) {
    lines.push('• NA');
  } else {
    data.blockers.forEach((item) => {
      const trimmed = item.trim();
      if (trimmed) {
        lines.push(`• ${trimmed.startsWith('•') ? trimmed.substring(1).trim() : trimmed}`);
      }
    });
  }

  lines.push('');
  lines.push("5️⃣ TOMORROW'S PRIORITIES");
  lines.push('');
  if (data.tomorrowPriorities.length === 0 || (data.tomorrowPriorities.length === 1 && !data.tomorrowPriorities[0].trim())) {
    lines.push('• NA');
  } else {
    data.tomorrowPriorities.forEach((item) => {
      const trimmed = item.trim();
      if (trimmed) {
        lines.push(`• ${trimmed.startsWith('•') ? trimmed.substring(1).trim() : trimmed}`);
      }
    });
  }

  lines.push('');
  lines.push('6️⃣ ADDITIONAL UPDATE');
  lines.push('');
  const addUpdate = data.additionalUpdate.trim();
  if (!addUpdate || addUpdate === 'NA') {
    lines.push('NA');
  } else {
    lines.push(`• ${addUpdate.startsWith('•') ? addUpdate.substring(1).trim() : addUpdate}`);
  }

  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━');
  lines.push('✅ EOD SUBMITTED');

  return lines.join('\n');
};

export const generateEODReportTextFromObj = (report: EODReport): string => {
  return generateReportText({
    memberName: report.memberName,
    formattedDate: report.formattedDate,
    tasks: report.tasks,
    achievements: report.achievements,
    pendingWork: report.pendingWork,
    blockers: report.blockers,
    tomorrowPriorities: report.tomorrowPriorities,
    additionalUpdate: report.additionalUpdate
  });
};
