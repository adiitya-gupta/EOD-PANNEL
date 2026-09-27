export type UserRole = 'admin' | 'member';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  designation?: string;
  profilePhoto?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}
