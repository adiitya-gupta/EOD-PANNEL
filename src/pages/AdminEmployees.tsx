import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsersService } from '../services/auth';
import { getAllTeamReports } from '../services/eodService';
import type { UserProfile } from '../types/auth';
import type { EODReport } from '../types/eod';
import { Users, Search, ChevronRight, UserCheck } from 'lucide-react';

export const AdminEmployees: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<EODReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userList = await getAllUsersService();
        setUsers(userList);
        const reportList = await getAllTeamReports();
        setReports(reportList);
      } catch (e) {
        console.error('Error loading employees list:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
            <Users className="w-6 h-6 text-red-600" />
            EOD Management — Team Employees
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            View active team members, total EOD submissions, and open individual work profiles.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
          No team members found matching "{search}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((emp) => {
            const empReports = reports.filter(r => r.userId === emp.uid);
            const latestReport = empReports[0];

            return (
              <Link
                key={emp.uid}
                to={`/admin/team/${emp.uid}`}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-slate-300 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold text-lg flex items-center justify-center border border-slate-800 uppercase group-hover:scale-105 transition-transform">
                      {emp.name.charAt(0)}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      emp.role === 'admin' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {emp.role}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-red-600 transition-colors">
                      {emp.name}
                    </h3>
                    <p className="text-xs text-slate-500">{emp.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Total EODs</p>
                      <p className="text-base font-bold text-slate-900">{empReports.length}</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Last Active</p>
                      <p className="text-xs font-bold text-slate-700 mt-0.5">
                        {latestReport ? latestReport.formattedDate : 'No activity'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs font-bold text-red-600 group-hover:translate-x-1 transition-transform">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" /> View Employee Profile
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
};
