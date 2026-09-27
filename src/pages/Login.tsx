import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../services/firebase';
import { LogIn, AlertCircle, Settings, Check } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, loginGoogle, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [firebaseConfigInput, setFirebaseConfigInput] = useState('');

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearError();
    setGoogleLoading(true);

    try {
      const user = await loginGoogle();
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Google Sign-In failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Parse object or env string
      let parsed;
      if (firebaseConfigInput.trim().startsWith('{')) {
        parsed = JSON.parse(firebaseConfigInput);
      } else {
        // Parse key-value lines
        const lines = firebaseConfigInput.split('\n');
        parsed = {};
        lines.forEach(line => {
          const [k, v] = line.split('=');
          if (k && v) {
            const cleanKey = k.trim().replace('VITE_FIREBASE_', '').toLowerCase();
            const mapKey: any = {
              'api_key': 'apiKey',
              'auth_domain': 'authDomain',
              'project_id': 'projectId',
              'storage_bucket': 'storageBucket',
              'messaging_sender_id': 'messagingSenderId',
              'app_id': 'appId'
            }[cleanKey] || k.trim();
            parsed[mapKey] = v.trim();
          }
        });
      }

      localStorage.setItem('opsiys_firebase_config_override', JSON.stringify(parsed));
      window.location.reload();
    } catch (err) {
      setLocalError('Invalid Firebase configuration format. Please paste valid JSON or .env keys.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand Logo */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg border border-slate-800 mb-3">
            <span className="w-4 h-4 rounded-full bg-red-600 animate-pulse"></span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-sans">
            OPSIYS
          </h1>
          <p className="mt-1 text-xs font-bold text-slate-500 uppercase tracking-widest">
            Daily EOD Reporting Portal
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10 space-y-6">
          
          {(localError || error) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{localError || error}</span>
            </div>
          )}

          {/* Single Easy Google Sign-In Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm border border-slate-300 shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              {googleLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></span>
                  Connecting Google Account...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Sign In with Google
                </>
              )}
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-xs font-bold text-slate-400 uppercase tracking-wider relative">
              Or Sign In with Email
            </span>
          </div>

          {/* Email / Password Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@opsiys.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Firebase Configuration Notice & Quick Setup Toggle */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              {isFirebaseConfigured ? '⚡ Firebase Auth Active' : '⚙️ Setup Firebase Keys'}
            </span>
            <button
              type="button"
              onClick={() => setShowConfigModal(!showConfigModal)}
              className="text-red-600 font-bold hover:underline flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" />
              Configure Firebase
            </button>
          </div>

          {showConfigModal && (
            <form onSubmit={handleSaveFirebaseConfig} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <p className="text-xs font-bold text-slate-800">Paste your Firebase Project Credentials:</p>
              <textarea
                rows={4}
                value={firebaseConfigInput}
                onChange={(e) => setFirebaseConfigInput(e.target.value)}
                placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "app.firebaseapp.com",\n  "projectId": "app-id"\n}`}
                className="w-full p-2.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Save Firebase Credentials
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
