import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import api, { extractError } from '../api/client';

const AuthContext = createContext(null);

const STORAGE_KEY = 'skillforge.user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const persist = (u) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.get('/auth/me');
      persist(data.user);
      return data.user;
    } catch {
      persist(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (user) {
          const data = await api.get('/auth/me');
          if (!cancelled) persist(data.user);
        } else {
          const data = await api.get('/auth/me');
          if (!cancelled) persist(data.user);
        }
      } catch {
        if (!cancelled) persist(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onExpired = () => {
      persist(null);
      if (!window.location.pathname.endsWith('/login')) {
        window.location.href = `${import.meta.env.BASE_URL}login?session=expired`;
      }
    };
    window.addEventListener('skillforge:session-expired', onExpired);
    return () => window.removeEventListener('skillforge:session-expired', onExpired);
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    persist(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await api.post('/auth/register', payload);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* best-effort */
    }
    persist(null);
  };

  const setUserProfile = (updated) => {
    persist({ ...user, ...updated });
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser, setUserProfile }),
    [user, loading, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const useErrorMessage = () => extractError;
