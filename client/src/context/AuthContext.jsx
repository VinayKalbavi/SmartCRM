import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  authLogin,
  authRegister,
  authGoogle,
  authGetMe,
  authUpdateProfile,
  authChangePassword,
  getStoredToken,
  setStoredToken,
  clearStoredToken,
} from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check token on initial load / refresh
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getStoredToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const data = await authGetMe();
        setUser(data.user);
      } catch (err) {
        console.warn('Session expired or invalid:', err.message);
        clearStoredToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Standard Email/Password Login
  const login = async (email, password, rememberMe = false) => {
    try {
      const data = await authLogin({ email, password, rememberMe });
      setStoredToken(data.token, rememberMe);
      setUser(data.user);
      toast.success(data.message || `Welcome back, ${data.user.name}!`);
      return { success: true, user: data.user };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please check your credentials.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Standard Email/Password Register
  const register = async (name, email, password, confirmPassword) => {
    try {
      const data = await authRegister({ name, email, password, confirmPassword });
      setStoredToken(data.token, false);
      setUser(data.user);
      toast.success(`Account created! Welcome, ${data.user.name}`);
      return { success: true, user: data.user };
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please check your details.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Google OAuth Login
  const googleLogin = async (credential) => {
    try {
      const data = await authGoogle(credential);
      // By default retain Google sessions in localStorage
      setStoredToken(data.token, true);
      setUser(data.user);
      toast.success(`Signed in with Google as ${data.user.name}`);
      return { success: true, user: data.user };
    } catch (err) {
      const msg = err.response?.data?.error || 'Google sign-in failed. Please try again.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Logout
  const logout = () => {
    clearStoredToken();
    setUser(null);
    toast.success('Logged out successfully');
  };

  // Update Profile Name
  const updateProfile = async (name) => {
    try {
      const data = await authUpdateProfile({ name });
      setUser(data.user);
      toast.success('Profile updated successfully');
      return { success: true, user: data.user };
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update profile';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Change or Set Password
  const changePassword = async (oldPassword, newPassword, confirmNewPassword) => {
    try {
      const data = await authChangePassword({ oldPassword, newPassword, confirmNewPassword });
      setUser(data.user);
      toast.success(data.message || 'Password updated successfully');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update password';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
