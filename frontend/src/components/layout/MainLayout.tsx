import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function MainLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        marginLeft: '4rem',
        padding: '2rem'
      }}>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;