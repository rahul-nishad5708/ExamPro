import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Award,
  ShieldAlert,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    ...(isAuthenticated
      ? [
          { name: 'Available Exams', path: '/exams' },
          { name: 'Performance Stats', path: '/dashboard' },
          ...(!isAdmin ? [{ name: 'My Results', path: '/results' }] : []),
          ...(isAdmin ? [{ name: 'Admin Console', path: '/admin/dashboard' }] : []),
        ]
      : [{ name: 'Candidate Entry', path: '/' }]),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Auth Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-xs shadow-inner">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-slate-200 leading-tight">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-indigo-400 capitalize">
                      {user?.role}
                    </p>
                  </div>
                </button>

                {dropdownOpen && (
                  <div
                    onMouseLeave={() => setDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-52 rounded-2xl glass-panel shadow-2xl py-2 border border-slate-800 animate-in fade-in zoom-in-95 duration-150 z-50"
                  >
                    <div className="px-4 py-2 border-b border-slate-800/60">
                      <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                      Dashboard
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin/exams"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        Admin Portal
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Profile Settings
                    </Link>

                    <div className="border-t border-slate-800/60 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/admin/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl border border-slate-800 transition-all"
                >
                  Admin Portal
                </Link>
                <Link
                  to="/"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  Enter Exam
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-800/60"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/60"
                >
                  Profile ({user?.name})
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-800 text-sm font-medium text-slate-200"
                >
                  Admin Portal
                </Link>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30"
                >
                  Enter Examination
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
