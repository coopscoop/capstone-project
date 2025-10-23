import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import ExplorePage from '@/pages/ExplorePage';
import EditorPage from '@/pages/EditorPage';
import SettingsPage from '@/pages/SettingsPage';
import MainLayout from '@/components/layout/MainLayout';

function App() {
  // TODO: Replace with real auth logic
  const isLoggedIn = true;
  // const isLoggedIn = false;

  return (
    <BrowserRouter>
      <Routes>
        {/* Login page - no sidebar */}
        <Route 
          path="/login" 
          element={isLoggedIn ? <Navigate to="/" /> : <LoginPage />} 
        />
        
        {/* Protected routes with sidebar layout */}
        <Route element={isLoggedIn ? <MainLayout /> : <Navigate to="/login" />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;