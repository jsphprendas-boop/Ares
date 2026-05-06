import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile } from '../types';
import { storageService } from '../services/storageService';

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  setLocalProfile: (profile: Profile) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  profile: null, 
  loading: true, 
  setLocalProfile: () => {},
  updateProfile: () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load local profile on boot
    const savedProfile = storageService.getProfile();
    setProfile(savedProfile);
    setLoading(false);
  }, []);

  const setLocalProfile = (p: Profile) => {
    storageService.saveProfile(p);
    setProfile(p);
  };

  const updateProfile = (updates: Partial<Profile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    setLocalProfile(updated);
  };

  const logout = () => {
    // Only clear Arcade Finance specific data to not affect other apps on the domain
    localStorage.removeItem('arcade_finance_profile');
    localStorage.removeItem('arcade_finance_transactions');
    localStorage.removeItem('arcade_finance_budgets');
    localStorage.removeItem('arcade_finance_goals');
    setProfile(null);
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ profile, loading, setLocalProfile, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
