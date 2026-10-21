import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing session on initial load
  const checkAuth = async () => {
    try {
      const data = await api.get('/auth/me');
      if (data?.success && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Student exam entry via shared password
  const enterExam = async (accessPassword, studentName) => {
    const data = await api.post('/auth/enter-exam', {
      accessPassword,
      studentName,
    });
    if (data?.success && data?.session) {
      setUser(data.session);
    }
    return data;
  };

  // Administrator login via email & password
  const adminLogin = async (email, password) => {
    const data = await api.post('/auth/admin/login', { email, password });
    if (data?.success && data?.user) {
      setUser(data.user);
    }
    return data;
  };

  // Logout / Exit exam session
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isAdmin: user?.role === 'admin',
    studentName: user?.role === 'student' ? user?.name : '',
    enterExam,
    adminLogin,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
