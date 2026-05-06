import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile } from '../types';
import { storageService } from '../services/storageService';
import { db } from './db';

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  setLocalProfile: (profile: Profile) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  logout: () => Promise<void>;
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
    const loadProfile = async () => {
      try {
        const savedProfile = await storageService.getProfile();
        if (savedProfile) {
          setProfile(savedProfile);
        }
      } catch (error) {
        console.error('Error loading local profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, []);

  const setLocalProfile = async (p: Profile) => {
    await storageService.saveProfile(p);
    setProfile(p);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    await setLocalProfile(updated);
  };

  const logout = async () => {
    if (confirm('¿Estás seguro de que deseas borrar TODOS tus datos locales? Esta acción es irreversible.')) {
      await db.delete();
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider value={{ profile, loading, setLocalProfile, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
