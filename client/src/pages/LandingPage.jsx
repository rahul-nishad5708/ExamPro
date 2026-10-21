import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  ShieldCheck,
  Zap,
  BarChart3,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Sparkles,
  Users,
  Award,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-xs font-semibold text-indigo-300 shadow-sm shadow-indigo-500/10 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Generation Online Examination Portal</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Assess Knowledge with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              Speed, Security & Precision
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
            ExamPro delivers high-stakes examination experiences with server-authoritative
            timers, automated instant scoring, negative marking rules, and deep answer key
            analytics.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to={isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Enter Examination'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/exams"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-sm glass-panel border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-900 transition-all"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Browse Exams</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl glass-panel-subtle border border-slate-800/80">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
              <p className="text-xs text-slate-400 mt-1">Server-Side Evaluation</p>
            </div>
            <div className="p-4 rounded-2xl glass-panel-subtle border border-slate-800/80">
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400">0.0s</p>
              <p className="text-xs text-slate-400 mt-1">Instant Grading</p>
            </div>
            <div className="p-4 rounded-2xl glass-panel-subtle border border-slate-800/80">
              <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400">99.9%</p>
              <p className="text-xs text-slate-400 mt-1">Session Resilience</p>
            </div>
            <div className="p-4 rounded-2xl glass-panel-subtle border border-slate-800/80">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">7+ Topics</p>
              <p className="text-xs text-slate-400 mt-1">CS, DSA, OS, Aptitude</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800/60 bg-slate-950/40">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Engineered For Reliability
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Enterprise Examination Engine
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Built from scratch to guarantee test integrity, preventing timer tampering and
              retaining candidate answers continuously.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-7 rounded-3xl glass-panel border border-slate-800/80 space-y-4 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Server-Authoritative Timer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Timestamps are validated against server clocks. Clients cannot alter countdowns,
                and expired tests auto-submit automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-3xl glass-panel border border-slate-800/80 space-y-4 hover:border-violet-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Seamless Reconnect & Save</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Network drops or accidental page reloads preserve active attempts. Progress is
                persisted without losing chosen options.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-3xl glass-panel border border-slate-800/80 space-y-4 hover:border-cyan-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Instant Answers & Explanations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configurable answer release schedules, comprehensive step-by-step solutions,
                and performance tracking charts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              How ExamPro Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl glass-panel-subtle border border-slate-800 relative space-y-3">
              <span className="text-4xl font-black text-indigo-500/40">01</span>
              <h4 className="text-base font-bold text-white">Select Your Examination</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter by technical category, difficulty, duration, and examine syllabus
                instructions before starting.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel-subtle border border-slate-800 relative space-y-3">
              <span className="text-4xl font-black text-violet-500/40">02</span>
              <h4 className="text-base font-bold text-white">Take With Distraction-Free UI</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Use the question palette to jump between questions, flag items for review, and
                monitor your countdown timer.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel-subtle border border-slate-800 relative space-y-3">
              <span className="text-4xl font-black text-cyan-500/40">03</span>
              <h4 className="text-base font-bold text-white">Review Verified Analytics</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Get an instant score report, question-by-question breakdown, and curated explanations
                for every option.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action footer banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/60">
        <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl glass-panel border border-indigo-500/30 text-center space-y-6 relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to Test Your Technical Knowledge?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              Join thousands of students and educators using ExamPro for Computer Science,
              Operating Systems, DBMS, and Networking exams.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-600/30 transition-all"
              >
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-4 sm:px-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} ExamPro Online Examination Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}
