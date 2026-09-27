import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { MemberTask, MemberTaskStatus, TaskPriority } from '../types/task';

const TASKS_COLLECTION = 'tasks';

export const createMemberTask = async (data: {
  assignedTo: string;
  assignedToName?: string;
  assignedBy: string;
  assignedByName?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: MemberTaskStatus;
  dueDate?: string;
}): Promise<MemberTask> => {
  const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  const nowISO = new Date().toISOString();

  const newTask: any = {
    id: taskId,
    assignedTo: data.assignedTo,
    assignedToName: data.assignedToName || '',
    assignedBy: data.assignedBy,
    assignedByName: data.assignedByName || '',
    title: data.title,
    description: data.description || '',
    priority: data.priority,
    status: data.status,
    dueDate: data.dueDate || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(taskRef, newTask);

  return {
    ...newTask,
    createdAt: nowISO,
    updatedAt: nowISO
  };
};

export const getTasksForMember = async (memberUid: string): Promise<MemberTask[]> => {
  try {
    const q = query(
      collection(db, TASKS_COLLECTION),
      where('assignedTo', '==', memberUid)
    );
    const snap = await getDocs(q);
    const tasks: MemberTask[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      tasks.push({
        id: docSnap.id,
        assignedTo: d.assignedTo,
        assignedToName: d.assignedToName,
        assignedBy: d.assignedBy,
        assignedByName: d.assignedByName,
        title: d.title,
        description: d.description,
        priority: d.priority || 'medium',
        status: d.status || 'pending',
        dueDate: d.dueDate || '',
        createdAt: d.createdAt?.toDate?.()?.toISOString() || d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAt?.toDate?.()?.toISOString() || d.updatedAt || new Date().toISOString()
      });
    });

    return tasks.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (e) {
    console.error('Error fetching member tasks:', e);
    return [];
  }
};

export const getAllTasksAdmin = async (): Promise<MemberTask[]> => {
  try {
    const snap = await getDocs(collection(db, TASKS_COLLECTION));
    const tasks: MemberTask[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      tasks.push({
        id: docSnap.id,
        assignedTo: d.assignedTo,
        assignedToName: d.assignedToName,
        assignedBy: d.assignedBy,
        assignedByName: d.assignedByName,
        title: d.title,
        description: d.description,
        priority: d.priority || 'medium',
        status: d.status || 'pending',
        dueDate: d.dueDate || '',
        createdAt: d.createdAt?.toDate?.()?.toISOString() || d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAt?.toDate?.()?.toISOString() || d.updatedAt || new Date().toISOString()
      });
    });

    return tasks.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (e) {
    console.error('Error fetching admin tasks:', e);
    return [];
  }
};

export const updateTaskStatus = async (taskId: string, status: MemberTaskStatus): Promise<void> => {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  await updateDoc(taskRef, {
    status,
    updatedAt: serverTimestamp()
  });
};

export const updateMemberTask = async (taskId: string, updates: Partial<MemberTask>): Promise<void> => {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  await updateDoc(taskRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteMemberTask = async (taskId: string): Promise<void> => {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  await deleteDoc(taskRef);
};

export const subscribeToMemberTasks = (memberUid: string, callback: (tasks: MemberTask[]) => void) => {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where('assignedTo', '==', memberUid)
  );

  return onSnapshot(q, (snap) => {
    const tasks: MemberTask[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      tasks.push({
        id: docSnap.id,
        assignedTo: d.assignedTo,
        assignedToName: d.assignedToName,
        assignedBy: d.assignedBy,
        assignedByName: d.assignedByName,
        title: d.title,
        description: d.description,
        priority: d.priority || 'medium',
        status: d.status || 'pending',
        dueDate: d.dueDate || '',
        createdAt: d.createdAt?.toDate?.()?.toISOString() || d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAt?.toDate?.()?.toISOString() || d.updatedAt || new Date().toISOString()
      });
    });
    tasks.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    callback(tasks);
  }, (err) => {
    console.error('Real-time tasks subscription error:', err);
  });
};
