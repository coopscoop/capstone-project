import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ControlPanelPage from '@/pages/ControlPanelPage';
import HomePage from '@/pages/HomePage';
import ExplorePage from '@/pages/ExplorePage';
import EditorPage from '@/pages/EditorPage';
import SettingsPage from '@/pages/SettingsPage';
import MainLayout from '@/components/layout/MainLayout';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-zinc-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-zinc-600">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Login page - redirect if already logged in */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/control-panel" /> : <LoginPage />} 
      />

      {/* Register page - redirect if already logged in */}
      <Route 
        path="/register" 
        element={user ? <Navigate to="/control-panel" /> : <RegisterPage />} 
      />

      {/* Control Panel - for demo purposes */}
      <Route
        path="/control-panel"
        element={
          <ProtectedRoute>
            <ControlPanelPage />
          </ProtectedRoute>
        }
      />
      
      {/* Protected routes with sidebar layout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Catch all - redirect to control panel for demo */}
      <Route path="*" element={<Navigate to="/control-panel" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;