import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD8a92pVEZXLI54wMw0KPg1SV8Wi0wOCY8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'gen-lang-client-0641957408.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'gen-lang-client-0641957408',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'gen-lang-client-0641957408.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '998963845226',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:998963845226:web:d4583a41c914e7388e9213'
};

const databaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || 'ai-studio-a185c4a6-3711-46df-95b2-df824ba10f83';

export const isFirebaseConfigured = true;

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app, databaseId);

console.log('[Firebase Diagnostics] Project ID:', app.options.projectId);
console.log('[Firebase Diagnostics] Auth Domain:', app.options.authDomain);
console.log('[Firebase Diagnostics] App ID:', app.options.appId);
console.log('[Firebase Diagnostics] Target Database ID:', databaseId);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const runFirestoreTestWrites = async (): Promise<{ eodSuccess: boolean; taskSuccess: boolean; error?: string }> => {
  try {
    const currentUser = auth.currentUser;
    console.log('[Firestore Write Test] Authenticated User UID:', currentUser?.uid || 'Unauthenticated / Anonymous Test');

    // 1. Write to eod_reports/firebase_test_document
    const eodTestRef = doc(db, 'eod_reports', 'firebase_test_document');
    await setDoc(eodTestRef, {
      test: true,
      source: 'EOD_FIRESTORE_INTEGRATION_TEST',
      createdAt: serverTimestamp(),
      writtenAtISO: new Date().toISOString(),
      updatedByUid: currentUser?.uid || 'test_runner'
    });
    console.log('[Firestore Write Test] eod_reports/firebase_test_document WRITTEN SUCCESSFULLY');

    // 2. Write to tasks/firebase_test_task
    const taskTestRef = doc(db, 'tasks', 'firebase_test_task');
    await setDoc(taskTestRef, {
      test: true,
      source: 'EOD_FIRESTORE_INTEGRATION_TEST',
      createdAt: serverTimestamp(),
      writtenAtISO: new Date().toISOString(),
      updatedByUid: currentUser?.uid || 'test_runner'
    });
    console.log('[Firestore Write Test] tasks/firebase_test_task WRITTEN SUCCESSFULLY');

    return { eodSuccess: true, taskSuccess: true };
  } catch (err: any) {
    console.error('[Firestore Write Test Failed]', err);
    return { eodSuccess: false, taskSuccess: false, error: err.message || String(err) };
  }
};

