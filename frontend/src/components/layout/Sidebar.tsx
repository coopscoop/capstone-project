import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Code, Settings, User } from 'lucide-react';
import pythonLogo from '@/assets/images/python-logo.png';

function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/explore', label: 'Explore', icon: Compass },
    { path: '/editor', label: 'Editor', icon: Code },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: '4rem',
      borderRight: '1px solid #e5e7eb',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem 0',
      alignItems: 'center'
    }}>
      {/* Logo/Brand */}
      <div style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
        <img src={pythonLogo} alt="Python Logo" style={{ width: '2rem' }} />
      </div>
      
      {/* Navigation Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', alignItems: 'center' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              title={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                backgroundColor: isActive ? '#f3f4f6' : 'transparent',
                textDecoration: 'none',
                color: 'black',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2}
              />
            </Link>
          );
        })}
      </div>

      {/* Bottom section - Profile */}
      <div style={{ marginTop: 'auto' }}>
        <Link
          to="/profile"
          title="Profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            color: 'black',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <User size={20} />
        </Link>
      </div>
    </nav>
  );
}

export default Sidebar;