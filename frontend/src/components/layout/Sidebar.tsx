import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, FileCode, User, LogOut, ArchiveIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/editor', icon: FileCode, label: 'Editor' },
    { path: '/settings', icon: User, label: 'Settings' },
    { path: '/control-panel', icon: ArchiveIcon, label: 'Control Panel' },
  ];

  const pythonLogo = '/python-logo.png';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-16 bg-white flex flex-col items-center py-6 border-r border-zinc-200">
      {/* Logo */}
      <div className="mb-8 w-8 h-8 flex items-center justify-center overflow-hidden shrink-0">
        <img 
          src={pythonLogo} 
          alt="Logo" 
          className="object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isSelected = location.pathname === path;

          return (
            <Link
              key={path}
              to={path}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors mb-2 ${
                isSelected 
                  ? 'bg-zinc-900 text-white' 
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
              title={label}
            >
              <Icon size={isSelected ? 22 : 20} strokeWidth={isSelected ? 2.5 : 2} />
            </Link>
          );
        })}
      </nav>

      {/* Admin Badge (if admin) */}
      {user?.isAdmin && (
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100 mb-2"
          title="Admin User"
        >
          <span className="text-purple-600 text-xs font-bold">A</span>
        </div>
      )}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-10 h-10 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors"
        title="Logout"
      >
        <LogOut size={20} />
      </button>
    </aside>
  );
};

export default Sidebar;