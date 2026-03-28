import { createContext, useEffect, useMemo, useState } from 'react';
import { getSnapshot, saveSnapshot } from '../utils/offlineStore';

export const AuthContext = createContext(null);

function normalizeUser(userData) {
  if (!userData) return null;

  return {
    ...userData,
    role: userData.role || null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      const storedToken = localStorage.getItem('aid_token');
      const storedUser = localStorage.getItem('aid_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(normalizeUser(JSON.parse(storedUser)));
      } else {
        const offlineUser = await getSnapshot('patient_profile');
        if (offlineUser) {
          setUser(normalizeUser(offlineUser));
        }
      }

      setIsLoading(false);
    };

    hydrate();
  }, []);

  const login = (nextToken, userData) => {
    const normalizedUser = normalizeUser(userData);
    localStorage.setItem('aid_token', nextToken);
    localStorage.setItem('aid_user', JSON.stringify(normalizedUser));
    setToken(nextToken);
    setUser(normalizedUser);
    saveSnapshot('patient_profile', normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem('aid_token');
    localStorage.removeItem('aid_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const updateProfile = (updates) => {
    setUser((current) => {
      const updatedUser = normalizeUser({ ...current, ...updates });
      localStorage.setItem('aid_user', JSON.stringify(updatedUser));
      saveSnapshot('patient_profile', updatedUser);
      return updatedUser;
    });
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      role: user?.role || null,
      login,
      logout,
      updateProfile,
    }),
    [isLoading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
