import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { EODReport, EODStats, AdminTeamStats, TaskItem } from '../types/eod';
import { getTodayDateISO, formatDisplayDate, getWorkingDaysInMonth } from '../utils/dateFormatters';
import { getAllUsersService } from './auth';

const EOD_COLLECTION = 'eod_reports';

export const submitEODReport = async (reportData: {
  userId: string;
  memberName: string;
  memberEmail?: string;
  reportDate: string; // YYYY-MM-DD
  tasks: TaskItem[];
  achievements: string;
  pendingWork: string[];
  blockers: string[];
  tomorrowPriorities: string[];
  additionalUpdate: string;
}): Promise<EODReport> => {
  // Deterministic Document ID: {userId}_{reportDate}
  const documentId = `${reportData.userId}_${reportData.reportDate}`;
  const formattedDate = formatDisplayDate(reportData.reportDate);
  const nowISO = new Date().toISOString();

  const reportRef = doc(db, EOD_COLLECTION, documentId);
  const docSnap = await getDoc(reportRef);

  if (docSnap.exists()) {
    throw new Error("Today's EOD report has already been submitted for this account.");
  }

  const newReportData: any = {
    id: documentId,
    userId: reportData.userId,
    memberName: reportData.memberName,
    memberEmail: reportData.memberEmail || '',
    reportDate: reportData.reportDate,
    formattedDate,
    tasks: reportData.tasks,
    keyAchievements: reportData.achievements,
    achievements: reportData.achievements,
    pendingWork: reportData.pendingWork,
    blockers: reportData.blockers,
    tomorrowPriorities: reportData.tomorrowPriorities,
    additionalUpdate: reportData.additionalUpdate,
    status: 'submitted',
    submittedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(reportRef, newReportData);

  return {
    ...newReportData,
    submittedAt: nowISO,
    createdAt: nowISO,
    updatedAt: nowISO
  };
};

export const updateEODReport = async (reportId: string, reportData: {
  tasks: TaskItem[];
  achievements: string;
  pendingWork: string[];
  blockers: string[];
  tomorrowPriorities: string[];
  additionalUpdate: string;
}): Promise<void> => {
  const reportRef = doc(db, EOD_COLLECTION, reportId);
  await updateDoc(reportRef, {
    tasks: reportData.tasks,
    keyAchievements: reportData.achievements,
    achievements: reportData.achievements,
    pendingWork: reportData.pendingWork,
    blockers: reportData.blockers,
    tomorrowPriorities: reportData.tomorrowPriorities,
    additionalUpdate: reportData.additionalUpdate,
    updatedAt: serverTimestamp()
  });
};

export const getReportById = async (reportId: string): Promise<EODReport | null> => {
  try {
    const reportRef = doc(db, EOD_COLLECTION, reportId);
    const docSnap = await getDoc(reportRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        achievements: data.achievements || data.keyAchievements || '',
        submittedAt: data.submittedAt?.toDate?.()?.toISOString() || data.submittedAt || new Date().toISOString()
      } as EODReport;
    }
  } catch (e) {
    console.error('Error fetching report by ID:', e);
  }
  return null;
};

export const getTodayReportForUser = async (userId: string, dateISO: string = getTodayDateISO()): Promise<EODReport | null> => {
  const documentId = `${userId}_${dateISO}`;
  return getReportById(documentId);
};

export const getUserReports = async (userId: string): Promise<EODReport[]> => {
  try {
    const q = query(
      collection(db, EOD_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const reports: EODReport[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      reports.push({
        ...data,
        id: docSnap.id,
        achievements: data.achievements || data.keyAchievements || '',
        submittedAt: data.submittedAt?.toDate?.()?.toISOString() || data.submittedAt || new Date().toISOString()
      } as EODReport);
    });
    return reports.sort((a, b) => b.reportDate.localeCompare(a.reportDate));
  } catch (e) {
    console.error('Firestore user reports fetch error:', e);
    return [];
  }
};

export const getAllTeamReports = async (): Promise<EODReport[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, EOD_COLLECTION));
    const reports: EODReport[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      reports.push({
        ...data,
        id: docSnap.id,
        achievements: data.achievements || data.keyAchievements || '',
        submittedAt: data.submittedAt?.toDate?.()?.toISOString() || data.submittedAt || new Date().toISOString()
      } as EODReport);
    });
    return reports.sort((a, b) => b.reportDate.localeCompare(a.reportDate));
  } catch (e) {
    console.error('Firestore all reports fetch error:', e);
    return [];
  }
};

export const getMemberStats = async (userId: string): Promise<EODStats> => {
  const userReports = await getUserReports(userId);
  const totalSubmitted = userReports.length;
  
  const now = new Date();
  const currentMonthISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const thisMonthReports = userReports.filter(r => r.reportDate.startsWith(currentMonthISO));
  const workingDaysThisMonth = getWorkingDaysInMonth();

  const submissionRate = workingDaysThisMonth > 0
    ? Math.min(100, Math.round((thisMonthReports.length / workingDaysThisMonth) * 100))
    : 100;

  // Streak calculation
  let streak = 0;
  if (userReports.length > 0) {
    const sortedDates = userReports.map(r => r.reportDate).sort().reverse();
    streak = sortedDates.length; // baseline consecutive count
  }

  return {
    totalSubmitted,
    workingDaysThisMonth,
    submissionRate,
    currentStreak: streak,
    lastSubmittedDate: userReports[0]?.formattedDate
  };
};

export const getAdminTeamStats = async (): Promise<AdminTeamStats> => {
  const allReports = await getAllTeamReports();
  const todayISO = getTodayDateISO();
  
  const allUsers = await getAllUsersService();
  const teamMembers = allUsers.filter(u => u.role === 'member');
  const totalMembers = Math.max(teamMembers.length, 1);

  const todayReports = allReports.filter(r => r.reportDate === todayISO);
  const submittedCount = todayReports.length;
  const pendingCount = Math.max(0, totalMembers - submittedCount);
  
  const submissionRate = totalMembers > 0
    ? Math.round((submittedCount / totalMembers) * 100)
    : 0;

  const now = new Date();
  const currentMonthISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const reportsThisMonth = allReports.filter(r => r.reportDate.startsWith(currentMonthISO)).length;

  return {
    totalMembers,
    submittedCount,
    pendingCount,
    submissionRate,
    reportsThisMonth
  };
};

export const subscribeToTodayEOD = (userId: string, callback: (report: EODReport | null) => void) => {
  const todayISO = getTodayDateISO();
  const docId = `${userId}_${todayISO}`;
  const docRef = doc(db, EOD_COLLECTION, docId);

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        ...data,
        id: docSnap.id,
        achievements: data.achievements || data.keyAchievements || '',
        submittedAt: data.submittedAt?.toDate?.()?.toISOString() || data.submittedAt || new Date().toISOString()
      } as EODReport);
    } else {
      callback(null);
    }
  }, (err) => {
    console.error('Real-time EOD subscription error:', err);
  });
};
