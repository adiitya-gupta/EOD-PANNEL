import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  PlusCircle, 
  History, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard,
  Users,
  ListTodo,
  BarChart3
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <span className="w-3 h-3 rounded-full bg-red-600 group-hover:scale-125 transition-transform duration-200"></span>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                OPSIYS <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider ml-1">EOD</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                Dashboard
              </Link>

              <Link
                to="/eod/new"
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  isActive('/eod/new')
                    ? 'bg-red-50 text-red-700 font-semibold border border-red-100'
                    : 'text-slate-600 hover:text-red-600 hover:bg-slate-50'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-red-600" />
                Fill Today's EOD
              </Link>

              <Link
                to="/eod/history"
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  isActive('/eod/history')
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <History className="w-4 h-4 text-slate-500" />
                My History
              </Link>

              {user.role === 'admin' && (
                <>
                  <div className="h-4 w-px bg-slate-200 mx-2"></div>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-black uppercase text-slate-500 px-2 tracking-wider">EOD MANAGEMENT</span>
                    
                    <Link
                      to="/admin/eod/overview"
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        isActive('/admin') || isActive('/admin/eod') || isActive('/admin/eod/overview')
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-white'
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                      Overview
                    </Link>

                    <Link
                      to="/admin/eod/reports"
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        isActive('/admin/reports') || isActive('/admin/eod/reports')
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-white'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      EOD Reports
                    </Link>

                    <Link
                      to="/admin/eod/employees"
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        isActive('/admin/eod/employees') || location.pathname.startsWith('/admin/team')
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-white'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      Employees
                    </Link>

                    <Link
                      to="/admin/eod/tasks"
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        isActive('/admin/tasks') || isActive('/admin/eod/tasks')
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-white'
                      }`}
                    >
                      <ListTodo className="w-3.5 h-3.5 text-amber-400" />
                      Tasks
                    </Link>

                    <Link
                      to="/admin/analytics"
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        isActive('/admin/analytics')
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-white'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                      Analytics
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900">{user.name}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{user.email}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                user.role === 'admin' ? 'bg-slate-900 text-red-400' : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 text-slate-700 rounded">
              {user.role}
            </span>
          </div>

          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <LayoutDashboard className="w-4 h-4 text-slate-500" />
            Dashboard
          </Link>

          <Link
            to="/eod/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-700 bg-red-50"
          >
            <PlusCircle className="w-4 h-4 text-red-600" />
            Fill Today's EOD
          </Link>

          <Link
            to="/eod/history"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <History className="w-4 h-4 text-slate-500" />
            My History
          </Link>

          {user.role === 'admin' && (
            <>
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <p className="px-3 text-[11px] font-black text-red-600 uppercase tracking-wider mb-1">EOD MANAGEMENT</p>
                <Link
                  to="/admin/eod/overview"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-900 hover:bg-slate-100"
                >
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  Overview
                </Link>
                <Link
                  to="/admin/eod/reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-900 hover:bg-slate-100"
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  EOD Reports
                </Link>
                <Link
                  to="/admin/eod/employees"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-900 hover:bg-slate-100"
                >
                  <Users className="w-4 h-4 text-emerald-500" />
                  Employees
                </Link>
                <Link
                  to="/admin/eod/tasks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-900 hover:bg-slate-100"
                >
                  <ListTodo className="w-4 h-4 text-amber-500" />
                  Tasks
                </Link>
                <Link
                  to="/admin/analytics"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-900 hover:bg-slate-100"
                >
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  Analytics
                </Link>
              </div>
            </>
          )}

          <button
            onClick={handleLogout}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
};
