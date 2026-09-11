import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isLoggedIn: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<User>;
  signup: (userData: Partial<User>) => Promise<User>;
  resetPassword: (email: string, newPassword: string) => Promise<User>;
  switchRole: (newRole: UserRole) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: (initialRole?: UserRole) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'campus_event_hub_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('student');

  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, password?: string, role?: UserRole): Promise<User> => {
    const res = await api.login(email, password, role);
    setUser(res.user);
    setIsAuthModalOpen(false);
    return res.user;
  };

  const signup = async (userData: Partial<User>): Promise<User> => {
    const res = await api.signup(userData);
    setUser(res.user);
    setIsAuthModalOpen(false);
    return res.user;
  };

  const resetPassword = async (email: string, newPassword: string): Promise<User> => {
    const res = await api.resetPassword(email, newPassword);
    setUser(res.user);
    setIsAuthModalOpen(false);
    return res.user;
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const updated = {
      ...user,
      role: newRole,
      name: newRole === 'organizer' || newRole === 'admin' 
        ? (user.name.includes('Dr.') ? user.name : `Dr. ${user.name} (Faculty Coordinator)`)
        : user.name.replace(/^Dr\.\s*/, '').replace(/\s*\(Faculty Coordinator\)/, '')
    };
    setUser(updated);
  };

  const logout = () => {
    setUser(null);
  };

  const openAuthModal = (initialRole: UserRole = 'student') => {
    setAuthModalRole(initialRole);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const currentRole: UserRole = user ? user.role : 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        role: currentRole,
        isLoggedIn: !!user,
        login,
        signup,
        resetPassword,
        switchRole,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
