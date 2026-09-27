import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NewEOD } from './pages/NewEOD';
import { EODDetail } from './pages/EODDetail';
import { EODHistory } from './pages/EODHistory';

import { AdminDashboard } from './pages/AdminDashboard';
import { AdminReports } from './pages/AdminReports';
import { AdminReportDetail } from './pages/AdminReportDetail';
import { AdminTasks } from './pages/AdminTasks';
import { AdminEmployees } from './pages/AdminEmployees';
import { AdminMemberProfile } from './pages/AdminMemberProfile';
import { AdminAnalytics } from './pages/AdminAnalytics';

const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export const AppContent: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      {!isLoginPage && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Member Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/reports"
            element={
              <ProtectedRoute>
                <EODHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-reports"
            element={
              <ProtectedRoute>
                <EODHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eod/new"
            element={
              <ProtectedRoute>
                <NewEOD />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eod/history"
            element={
              <ProtectedRoute>
                <EODHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eod/:id"
            element={
              <ProtectedRoute>
                <EODDetail />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes - EOD Management Module */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/eod"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/eod/overview"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/eod/reports"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/:id"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminReportDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/eod/employees"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminEmployees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/eod/tasks"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tasks"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/team/:uid"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminMemberProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminAnalytics />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isLoginPage && (
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span className="font-bold text-slate-900">OPSIYS</span> — Daily EOD & Task Management System
            </div>
            <p>© {new Date().getFullYear()} OPSIYS Inc. Internal SaaS Platform.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
