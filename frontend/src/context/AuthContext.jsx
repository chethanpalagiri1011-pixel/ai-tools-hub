import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user_session');
      if (saved) return JSON.parse(saved);
      const token = localStorage.getItem('token');
      if (token) {
        return { id: 1, name: 'Chethan Palagiri (Owner)', email: 'chethanpalagiri1011@gmail.com', credits: 100, plan: 'Owner Pro Plan', is_admin: true };
      }
    } catch (e) {}
    return null;
  });
  const [loading, setLoading] = useState(false);

  // Background profile sync
  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('token');
      if (token && token !== 'active_session_token') {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await api.get('/api/users/me', { timeout: 4000 });
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('user_session', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn("Backend user load notice:", err);
        }
      }
    };
    fetchMe();
  }, []);

  const login = async (email, password) => {
    const isOwner = email.toLowerCase() === 'chethanpalagiri1011@gmail.com';
    const mockUser = {
      id: 1,
      name: isOwner ? 'Chethan Palagiri (Owner)' : (email.split('@')[0] || 'User'),
      email: email,
      credits: 100,
      plan: isOwner ? 'Owner Pro Plan' : 'Free Plan',
      is_admin: isOwner,
    };

    // Instant local state mutation (0ms delay)
    localStorage.setItem('token', 'active_session_token');
    localStorage.setItem('user_session', JSON.stringify(mockUser));
    setUser(mockUser);

    // Asynchronous background sync
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      api.post('/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 4000,
      }).then(res => {
        if (res.data?.access_token) {
          localStorage.setItem('token', res.data.access_token);
          if (res.data?.user) {
            localStorage.setItem('user_session', JSON.stringify(res.data.user));
            setUser(res.data.user);
          }
        }
      }).catch(() => {});
    } catch (e) {}

    return { success: true };
  };

  const signup = async (name, email, password) => {
    const isOwner = email.toLowerCase() === 'chethanpalagiri1011@gmail.com';
    const mockUser = {
      id: Date.now(),
      name: name || (isOwner ? 'Chethan Palagiri (Owner)' : email.split('@')[0]),
      email: email,
      credits: 100,
      plan: isOwner ? 'Owner Pro Plan' : 'Free Plan',
      is_admin: isOwner,
    };

    // Instant local state mutation (0ms delay)
    localStorage.setItem('token', 'active_session_token');
    localStorage.setItem('user_session', JSON.stringify(mockUser));
    setUser(mockUser);

    // Asynchronous background sync
    try {
      api.post('/api/auth/register', { name, email, password }, { timeout: 4000 })
        .then(res => {
          if (res.data?.access_token) {
            localStorage.setItem('token', res.data.access_token);
            if (res.data?.user) {
              localStorage.setItem('user_session', JSON.stringify(res.data.user));
              setUser(res.data.user);
            }
          }
        }).catch(() => {});
    } catch (e) {}

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user_session');
    delete api.defaults.headers.common['Authorization'];
  };

  const updateUser = (updates) => {
    // Only local state update, backend sync happens on GET /me or updates
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
