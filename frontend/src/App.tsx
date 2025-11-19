import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ControlPanelPage from '@/pages/ControlPanelPage';
import HomePage from '@/pages/HomePage';
import ExplorePage from '@/pages/ExplorePage';
import EditorPage from '@/pages/EditorPage';
import SettingsPage from '@/pages/SettingsPage';
import MainLayout from '@/components/layout/MainLayout';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <div className="text-lg text-zinc-400">Loading...</div>
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
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <div className="text-lg text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes - NO sidebar */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" /> : <LoginPage />} 
      />
      
      <Route 
        path="/register" 
        element={user ? <Navigate to="/" /> : <RegisterPage />} 
      />
      
      <Route 
        path="/reset-password" 
        element={<ResetPasswordPage />} 
      />

      {/* Control Panel - separate from MainLayout */}
      <Route
        path="/control-panel"
        element={
          <ProtectedRoute>
            <ControlPanelPage />
          </ProtectedRoute>
        }
      />
      
      {/* Protected routes WITH sidebar layout */}
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

      {/* Catch all - redirect to home if logged in, login if not */}
      <Route path="*" element={user ? <Navigate to="/" /> : <Navigate to="/login" />} />
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