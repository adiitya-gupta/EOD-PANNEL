import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from './firebase';
import type { UserProfile, UserRole } from '../types/auth';

const STORAGE_KEY_USER = 'opsiys_current_user';

const persistUserProfile = (profile: UserProfile) => {
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
};

export const loginWithGoogle = async (): Promise<UserProfile> => {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error('Firebase configuration missing. Please click "Configure Firebase" on the login screen to enter your Firebase project keys.');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const profile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: data.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Team Member',
        role: (data.role as UserRole) || 'member',
        department: data.department || '',
        designation: data.designation || '',
        profilePhoto: data.profilePhoto || firebaseUser.photoURL || '',
        isActive: data.isActive !== false,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
      persistUserProfile(profile);
      return profile;
    } else {
      const email = firebaseUser.email || '';
      const isDefaultAdmin = email.toLowerCase().includes('admin');
      
      const profile: UserProfile = {
        uid: firebaseUser.uid,
        email,
        name: firebaseUser.displayName || email.split('@')[0] || 'Team Member',
        role: isDefaultAdmin ? 'admin' : 'member',
        isActive: true,
        createdAt: new Date().toISOString()
      };

      await setDoc(userRef, {
        uid: profile.uid,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      persistUserProfile(profile);
      return profile;
    }
  } catch (err: any) {
    console.error('Google Sign-In failed:', err);
    throw new Error(err.message || 'Google Sign-In failed. Please check popup permissions.');
  }
};

export const loginWithEmail = async (email: string, pass: string): Promise<UserProfile> => {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error('Firebase configuration missing. Please click "Configure Firebase" on the login screen.');
  }

  try {
    let firebaseUser;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      firebaseUser = userCredential.user;
    } catch (authError: any) {
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
        const createCredential = await createUserWithEmailAndPassword(auth, email, pass);
        firebaseUser = createCredential.user;
      } else {
        throw authError;
      }
    }

    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const profile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || email,
        name: data.name || email.split('@')[0],
        role: (data.role as UserRole) || 'member',
        department: data.department || '',
        designation: data.designation || '',
        isActive: data.isActive !== false,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
      persistUserProfile(profile);
      return profile;
    } else {
      const isDefaultAdmin = email.toLowerCase().includes('admin');
      const profile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || email,
        name: email.split('@')[0],
        role: isDefaultAdmin ? 'admin' : 'member',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      await setDoc(userRef, {
        uid: profile.uid,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      persistUserProfile(profile);
      return profile;
    }
  } catch (err: any) {
    console.error('Email Auth login failed:', err);
    throw new Error(err.message || 'Authentication failed. Please check your credentials.');
  }
};

export const logoutUser = async (): Promise<void> => {
  if (auth) {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase logout notice:', e);
    }
  }
  localStorage.removeItem(STORAGE_KEY_USER);
};

export const getCurrentStoredUser = (): UserProfile | null => {
  const data = localStorage.getItem(STORAGE_KEY_USER);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const getAllUsersService = async (): Promise<UserProfile[]> => {
  if (isFirebaseConfigured && db) {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const list: UserProfile[] = [];
      usersSnap.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          uid: docSnap.id,
          email: d.email || '',
          name: d.name || '',
          role: d.role || 'member',
          department: d.department || '',
          designation: d.designation || '',
          isActive: d.isActive !== false
        });
      });
      return list;
    } catch (e) {
      console.warn('Fetch users error:', e);
    }
  }
  const current = getCurrentStoredUser();
  return current ? [current] : [];
};
