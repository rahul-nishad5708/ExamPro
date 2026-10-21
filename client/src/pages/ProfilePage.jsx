import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  });

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setIsUpdatingName(true);
    try {
      await updateProfile({ name: name.trim() });
      toast.success('Profile name updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update name');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleChangePassword = async (values) => {
    setIsChangingPass(true);
    try {
      await changePassword(
        values.currentPassword,
        values.newPassword,
        values.confirmNewPassword
      );
      toast.success('Password changed successfully');
      reset();
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Account & Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your personal information, security credentials, and role status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center font-extrabold text-2xl text-white shadow-xl shadow-indigo-600/30">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 capitalize">
            <ShieldCheck className="w-3.5 h-3.5" />
            {user?.role} Account
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
            <p>Member since: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
            <p>Status: <span className="text-emerald-400 font-semibold">Active</span></p>
          </div>
        </div>

        {/* Update Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* General Information */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Personal Information</span>
            </h3>

            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-sm text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingName}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {isUpdatingName ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Name'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  {...register('currentPassword')}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
                {errors.currentPassword && (
                  <p className="mt-1 text-xs text-rose-400">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    {...register('newPassword')}
                    placeholder="Min. 6 chars"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-xs text-rose-400">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    {...register('confirmNewPassword')}
                    placeholder="Repeat new password"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                  {errors.confirmNewPassword && (
                    <p className="mt-1 text-xs text-rose-400">
                      {errors.confirmNewPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all cursor-pointer"
                >
                  {isChangingPass ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
