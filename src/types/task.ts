export type TaskPriority = 'low' | 'medium' | 'high';
export type MemberTaskStatus = 'pending' | 'in-progress' | 'completed';

export interface MemberTask {
  id: string;
  assignedTo: string;      // Firebase Member UID (Authoritative)
  assignedToName?: string;  // Member Name
  assignedBy: string;      // Admin Firebase UID
  assignedByName?: string;  // Admin Name
  title: string;
  description?: string;
  priority: TaskPriority;
  status: MemberTaskStatus;
  dueDate?: string;        // YYYY-MM-DD
  createdAt?: string;
  updatedAt?: string;
}
