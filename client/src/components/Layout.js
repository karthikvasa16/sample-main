import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';

function Layout() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      width: '100%',
      height: '100vh',
      backgroundColor: '#f5f7fa',
      overflow: 'hidden',
      margin: 0,
      padding: 0,
      position: 'relative'
    }}>
      <Sidebar />
      <main style={{ 
        flex: 1,
        padding: isMobile ? '1rem' : '2rem', 
        overflowX: 'hidden',
        overflowY: 'auto',
        paddingTop: isMobile ? '4rem' : '2rem',
        paddingBottom: '2rem',
        boxSizing: 'border-box',
        backgroundColor: '#f5f7fa',
        margin: 0,
        width: 'auto',
        position: 'relative',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ flex: '1 0 auto' }}>
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
}

export default Layout;
