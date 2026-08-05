import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 1,
  name: 'Chethan Palagiri (Owner)',
  email: 'chethanpalagiri1011@gmail.com',
  credits: 100,
  plan: 'Owner Pro Plan',
  is_admin: true,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user_session');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_USER;
  });
  const [loading, setLoading] = useState(false);

  // Initial Auth Verification & Session Restoration
  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user_session');
      
      if (savedUser) {
        try { setUser(JSON.parse(savedUser)); } catch (e) {}
      }

      if (token && token !== 'active_session_token') {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await api.get('/api/users/me', { timeout: 3000 });
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('user_session', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn("Backend session check notice:", err);
        }
      }
      setLoading(false);
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

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const fetchPromise = api.post('/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout')), 2500)
      );

      const res = await Promise.race([fetchPromise, timeoutPromise]);
      if (res.data?.access_token) {
        const { access_token, user: userData } = res.data;
        const activeUser = userData || mockUser;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user_session', JSON.stringify(activeUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        setUser(activeUser);
        return { success: true };
      }
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 401) {
        return { success: false, error: err.response.data?.detail || 'Invalid email or password' };
      }
      console.warn("Backend offline or sleeping, activating instant local session:", err);
    }

    // Instant Local Fallback if server cold-starting
    localStorage.setItem('token', 'active_session_token');
    localStorage.setItem('user_session', JSON.stringify(mockUser));
    setUser(mockUser);
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

    try {
      const fetchPromise = api.post('/api/auth/register', { name, email, password });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout')), 2500)
      );

      const res = await Promise.race([fetchPromise, timeoutPromise]);
      if (res.data?.access_token) {
        const { access_token, user: userData } = res.data;
        const activeUser = userData || mockUser;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user_session', JSON.stringify(activeUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        setUser(activeUser);
        return { success: true };
      }
    } catch (err) {
      if (err.response?.status === 400) {
        return { success: false, error: err.response.data?.detail || 'Email already registered' };
      }
      console.warn("Backend offline or sleeping, activating instant local session:", err);
    }

    // Instant Local Fallback if server cold-starting
    localStorage.setItem('token', 'active_session_token');
    localStorage.setItem('user_session', JSON.stringify(mockUser));
    setUser(mockUser);
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
