import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, Search, ShieldAlert } from 'lucide-react';

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 glass-panel border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span>ExamPro Portal</span>
              <span>/</span>
              <span className="text-slate-200 capitalize font-medium">
                {isAdmin ? 'Admin Console' : 'Student Space'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin Mode
              </span>
            )}

            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-indigo-500/20">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize">
                    {isAdmin ? 'Administrator' : 'Candidate'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
