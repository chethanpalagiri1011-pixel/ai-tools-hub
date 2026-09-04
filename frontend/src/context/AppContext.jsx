import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTool, setActiveTool] = useState('image');

  // Fetch history when user logs in
  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        try {
          const res = await api.get('/api/history/');
          setHistory(res.data);
        } catch (err) {
          console.error("Failed to fetch history", err);
        }
      } else {
        setHistory([]);
      }
    };
    fetchHistory();
  }, [user]);

  const addToHistory = (item) => {
    // Add locally to UI. In a real app, history entries are created by the /image, /summarize backend endpoints.
    // So the backend automatically adds them when we call the generator endpoints.
    // However, to keep UI snappy, we reload history or append.
    setHistory(prev => [item, ...prev].slice(0, 100));
  };

  const deleteFromHistory = async (id) => {
    try {
      await api.delete(`/api/history/${id}`);
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      console.error("Failed to delete history item", err);
    }
  };

  const toggleSaveHistory = async (id) => {
    try {
      const res = await api.put(`/api/history/${id}/save`);
      setHistory(prev => prev.map(h => h.id === id ? { ...h, saved: res.data.saved } : h));
    } catch (err) {
      console.error("Failed to toggle save history", err);
    }
  };

  const clearHistory = async () => {
    try {
      await api.delete('/api/history');
      setHistory([]);
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  const getHistoryByType = (type) => history.filter(h => h.type === type);

  return (
    <AppContext.Provider value={{
      history, addToHistory, deleteFromHistory, toggleSaveHistory, clearHistory, getHistoryByType,
      sidebarOpen, setSidebarOpen,
      activeTool, setActiveTool
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
