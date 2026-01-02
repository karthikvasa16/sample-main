import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';
import AdminTopNav from './AdminTopNav';

function Layout() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ecfdf5' }}>
      <Sidebar />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {isAdmin && <AdminTopNav />}

        <main style={{
          flex: 1,
          padding: isMobile ? '1rem' : '2rem',
          overflowX: 'hidden',
          overflowY: 'auto',
          paddingTop: isAdmin ? '2rem' : (isMobile ? '4rem' : '2rem'), // Adjusted padding top as TopNav is now relative/sticky in flow or fixed?
          paddingBottom: '2rem',
          boxSizing: 'border-box',
          backgroundColor: '#ecfdf5',
          fontFamily: "'Outfit', sans-serif"
        }}>
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default Layout;
