import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  User,
  PlusCircle,
  FileQuestion,
  Users,
  ShieldCheck,
  LogOut,
  ChevronRight,
  ExternalLink,
  Zap,
  Activity,
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const studentLinks = [
    { name: 'Available Exams', path: '/exams', icon: BookOpen },
    { name: 'Practice Tests', path: '/practice-tests', icon: Zap },
    { name: 'My Results', path: '/results', icon: Award },
    { name: 'Performance Stats', path: '/dashboard', icon: LayoutDashboard },
  ];

  const adminLinks = [
    { name: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Exams', path: '/admin/exams', icon: BookOpen },
    { name: 'Practice Tests', path: '/admin/practice-tests', icon: Zap },
    { name: 'Student Activity', path: '/admin/student-activity', icon: Activity },
    { name: 'Create New Exam', path: '/admin/exams/create', icon: PlusCircle },
    { name: 'Question Bank', path: '/admin/questions', icon: FileQuestion },
    { name: 'Student Results', path: '/admin/results', icon: Award },
    { name: 'Candidate Accounts', path: '/admin/students', icon: Users },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <>
      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col bg-slate-950/95 border-r border-slate-800/80 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
          <Logo size="md" />
        </div>

        {/* Role Badge Indicator */}
        <div className="px-6 py-4">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  isAdmin
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                }`}
              >
                {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className="max-w-[130px]">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">
                  {isAdmin ? 'Administrator' : 'Candidate Session'}
                </p>
              </div>
            </div>
            {isAdmin ? (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Admin
              </span>
            ) : (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active
              </span>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Navigation
          </p>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                end={link.path === '/admin/dashboard' || link.path === '/exams'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                  <span>{link.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
              </NavLink>
            );
          })}

          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-slate-800/80">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Views
              </p>
              <NavLink
                to="/exams"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-all"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <span>Exams Catalog</span>
                </div>
              </NavLink>
            </div>
          )}
        </div>

        {/* Bottom User & Logout */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{isAdmin ? 'Sign Out' : 'Exit Exam Session'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
