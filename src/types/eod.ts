export type TaskStatus = '✅ Completed' | '🔄 In Progress' | '⏳ Pending' | '🚫 Blocked' | 'NA';

export interface TaskItem {
  id: string;
  title?: string;
  description: string;
  status: TaskStatus;
  output?: string;
}

export type ReportStatus = 'submitted' | 'pending' | 'late';

export interface EODReport {
  id: string;              // Deterministic: {userId}_{YYYY-MM-DD}
  userId: string;          // Authoritative Firebase UID
  memberName: string;      // Display only
  memberEmail?: string;
  reportDate: string;      // YYYY-MM-DD (Asia/Kolkata timezone)
  formattedDate: string;  // e.g. "27 September 2026"
  tasks: TaskItem[];
  achievements: string;
  pendingWork: string[];
  blockers: string[];
  tomorrowPriorities: string[];
  additionalUpdate: string;
  status: ReportStatus;
  submittedAt: string;     // ISO String or Timestamp
  createdAt?: string;
  updatedAt?: string;
}

export interface EODStats {
  totalSubmitted: number;
  workingDaysThisMonth: number;
  submissionRate: number; // percentage e.g. 82
  currentStreak: number;
  lastSubmittedDate?: string;
}

export interface AdminTeamStats {
  totalMembers: number;
  submittedCount: number;
  pendingCount: number;
  submissionRate: number;
  reportsThisMonth: number;
}
