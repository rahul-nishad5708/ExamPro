import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import {
  User,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldAlert,
  Sparkles,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function StudentEntryPage() {
  const [studentName, setStudentName] = useState('');
  const [accessPassword, setAccessPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { enterExam } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const trimmedName = studentName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setValidationError('Please enter your full name (minimum 2 characters).');
      return;
    }

    if (!accessPassword) {
      setValidationError('Please enter the exam access password.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await enterExam(accessPassword, trimmedName);
      toast.success(`Welcome, ${trimmedName}! Examination access granted.`);
      navigate('/exams');
    } catch (err) {
      setValidationError(err.message || 'Access denied. Please verify your exam password.');
      toast.error(err.message || 'Incorrect access password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-10 right-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <Logo size="md" />
        <Link
          to="/admin/login"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Admin Portal</span>
        </Link>
      </header>

      {/* Center Content Card */}
      <main className="w-full max-w-md mx-auto px-4 py-8">
        <div className="glass-panel p-7 sm:p-9 rounded-3xl border border-slate-800/90 shadow-2xl space-y-6">
          {/* Header Title & Icon */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Candidate Examination Portal
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Enter your full name and the exam access password provided by your proctor or instructor.
            </p>
          </div>

          {/* Error Message Box */}
          {validationError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <span className="font-bold flex-shrink-0">⚠️</span>
              <span className="leading-snug">{validationError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Candidate Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  placeholder="e.g. Alex Mercer"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                This name will appear on your verified score sheet.
              </p>
            </div>

            {/* Exam Access Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Exam Access Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={accessPassword}
                  onChange={(e) => {
                    setAccessPassword(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  placeholder="Enter exam password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Validating Session...
                  </>
                ) : (
                  <>
                    <span>Enter Examination Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Feature Badges */}
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Scoring</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Session Recovery</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 px-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} ExamPro Online Examination Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}
