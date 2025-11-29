import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import { useEffect } from 'react';

const MainLayout = () => {

  // Scroll to top on route change, fixes some issues with the sidebar/home bar covering content
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="flex-1 md:overflow-auto pb-16 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;