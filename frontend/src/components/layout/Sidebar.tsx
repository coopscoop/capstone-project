import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, FileCode, Settings, User } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/editor', icon: FileCode, label: 'Editor' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const pythonLogo = '/src/assets/images/python-logo.png';
  const Location = useLocation();

  return (
    <aside className="w-16 bg-white flex flex-col items-center py-6 border-r border-zinc-800">
      {/* Logo */}
      <div className="mb-8 w-8 h-8 flex items-center justify-center overflow-hidden shrink-0 object-contain">
        <img 
          src={pythonLogo} 
          alt="Logo" 
          className=" object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col mx-5">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isSelected = Location.pathname == path;

          return (
            <Link
              key={path}
              to={path}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-zinc-100 mt-4 mb-2`}
              title={label}
            >
              <Icon size={isSelected ? 22 : 20} strokeWidth={isSelected ? 2.25 : 2}/>
            </Link>
          );
        })}
      </nav>

      {/* Profile at bottom */}
      <Link
        to="/profile"
        className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-zinc-100 mt-4 mb-2"
        title="Profile"
      >
        <User size={20} />
      </Link>
    </aside>
  );
};

export default Sidebar;