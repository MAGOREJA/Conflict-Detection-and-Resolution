import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, UserRole } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string) => {
    const response = await api.login(username, password);
    
    if (response.error) {
      toast.error(response.error);
      throw new Error(response.error);
    }

    const userData = response.data as User;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    toast.success('Login successful!');
  };

  const register = async (username: string, password: string, role: UserRole) => {
    const response = await api.register(username, password, role);
    
    if (response.error) {
      toast.error(response.error);
      throw new Error(response.error);
    }

    toast.success('Registration successful! Please login.');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    api.logout();
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};