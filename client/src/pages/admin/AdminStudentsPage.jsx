import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { Users, Search, ShieldCheck, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getStudents({
        page,
        limit: 20,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
      });
      if (res.success) {
        setStudents(res.students || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load students list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, roleFilter]);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await adminService.updateStudentStatus(id, {
        isActive: !currentStatus,
      });
      toast.success(res.message);
      setStudents((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isActive: !currentStatus } : s))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update student status.');
    }
  };

  const handleToggleRole = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    if (!window.confirm(`Are you sure you want to change role to ${newRole}?`)) return;

    try {
      const res = await adminService.updateStudentStatus(id, { role: newRole });
      toast.success(res.message);
      setStudents((prev) =>
        prev.map((s) => (s._id === id ? { ...s, role: newRole } : s))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update role.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Manage Candidate Accounts
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Supervise user registrations, grant administrative privileges, and toggle account access.
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl glass-panel-subtle border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate by name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading candidates..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchStudents} />
      ) : students.length === 0 ? (
        <EmptyState title="No users found" description="No candidate accounts match search." />
      ) : (
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/60 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Tests Attempted</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4">Access Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {students.map((student) => (
                <tr key={student._id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-xs border border-indigo-500/20">
                      {student.name?.charAt(0).toUpperCase()}
                    </div>
                    <span>{student.name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{student.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        student.role === 'admin'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {student.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold">
                    {student.totalAttempts || 0}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        student.isActive
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {student.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleRole(student._id, student.role)}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                        title="Toggle role between student and admin"
                      >
                        {student.role === 'admin' ? 'Make Student' : 'Make Admin'}
                      </button>
                      <button
                        onClick={() => handleToggleStatus(student._id, student.isActive)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                          student.isActive
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                      >
                        {student.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
