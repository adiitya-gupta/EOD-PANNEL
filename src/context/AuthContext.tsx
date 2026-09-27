import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types/auth';
import { getCurrentStoredUser, loginWithEmail, loginWithGoogle, logoutUser } from '../services/auth';
import { isFirebaseConfigured, auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  isDemoMode: boolean;
  login: (email: string, pass: string) => Promise<UserProfile>;
  loginGoogle: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      if (isFirebaseConfigured && auth) {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            const stored = getCurrentStoredUser();
            if (stored && stored.uid === firebaseUser.uid) {
              setUser(stored);
            } else {
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member',
                role: firebaseUser.email?.includes('admin') ? 'admin' : 'member',
                isActive: true
              });
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });
        return () => unsubscribe();
      } else {
        const stored = getCurrentStoredUser();
        if (stored) {
          setUser(stored);
        }
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    setError(null);
    setLoading(true);
    try {
      const loggedInUser = await loginWithEmail(email, pass);
      setUser(loggedInUser);
      setLoading(false);
      return loggedInUser;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  };

  const loginGoogle = async (): Promise<UserProfile> => {
    setError(null);
    setLoading(true);
    try {
      const loggedInUser = await loginWithGoogle();
      setUser(loggedInUser);
      setLoading(false);
      return loggedInUser;
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    await logoutUser();
    setUser(null);
    setLoading(false);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isDemoMode: !isFirebaseConfigured,
      login,
      loginGoogle,
      logout,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
