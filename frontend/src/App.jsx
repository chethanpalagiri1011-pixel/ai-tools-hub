import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

import LandingPage    from './pages/LandingPage';
import LoginPage      from './pages/LoginPage';
import SignupPage     from './pages/SignupPage';

import Dashboard      from './pages/Dashboard';
import AIToolsPage    from './pages/AIToolsPage';
import ProfilePage    from './pages/ProfilePage';
import SettingsPage   from './pages/SettingsPage';
import HistoryPage    from './pages/HistoryPage';
import ArcadePage     from './pages/ArcadePage';
import MyImagesPage   from './pages/MyImagesPage';
import AdminDashboard from './pages/AdminDashboard';
import DashboardLayout from './layouts/DashboardLayout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center flex-col text-white">
        <div className="w-12 h-12 rounded-full border-2 border-purple-600 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-medium text-purple-300">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  return children;
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'rgba(13, 13, 26, 0.95)',
                color: '#e2e8f0',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                backdropFilter: 'blur(20px)',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#a855f7', secondary: '#050510' } },
              error:   { iconTheme: { primary: '#f43f5e', secondary: '#050510' } },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/"       element={<LandingPage />} />
            <Route path="/login"  element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

            {/* Protected — wrapped in DashboardLayout */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index        element={<Dashboard />} />
              <Route path="tools"     element={<AIToolsPage />} />
              <Route path="my-images" element={<MyImagesPage />} />
              <Route path="history"   element={<HistoryPage />} />
              <Route path="profile"   element={<ProfilePage />} />
              <Route path="settings"  element={<SettingsPage />} />
              <Route path="arcade"    element={<ArcadePage />} />
              <Route path="admin"     element={<AdminDashboard />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
