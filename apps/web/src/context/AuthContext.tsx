'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MODERATOR' | 'COACH' | 'STUDENT';
}

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper functions for localStorage with SSR safety
const getStoredToken = (): string | null => {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
  } catch {
    return null;
  }
};

const setStoredToken = (token: string): void => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('auth_token', token);
    }
  } catch {
    // Ignore localStorage errors
  }
};

const removeStoredToken = (): void => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('auth_token');
    }
  } catch {
    // Ignore localStorage errors
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = getStoredToken();
        if (storedToken) {
          setToken(storedToken);
          // Verify token and get user info
          const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json() as AuthResponse;
            if (data.user) {
              setUser(data.user);
            }
          } else {
            // Token is invalid, remove it
            removeStoredToken();
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        removeStoredToken();
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json() as AuthResponse;

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        setStoredToken(data.token);
        
        router.push('/dashboard');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json() as AuthResponse;

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        setStoredToken(data.token);
        
        router.push('/dashboard');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    removeStoredToken();
    router.push('/');
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}