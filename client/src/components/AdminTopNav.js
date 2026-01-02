import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Search, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom'; // Import useLocation

function AdminTopNav() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuth(); // Ensure logout is imported
  const [searchTerm, setSearchTerm] = useState('');

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // Determine title based on path
  const getPageTitle = (pathname) => {
    if (pathname.includes('/leads')) return 'Student Leads';
    if (pathname.includes('/applications')) return 'Loan Applications';
    if (pathname.includes('/reports')) return 'Reports';
    if (pathname.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  const pageTitle = getPageTitle(useLocation().pathname);

  const handleLogout = () => {
    logout();
    window.location.href = '/login'; // Force reload/redirect to be sure
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(255, 255, 255, 0.85)', // Translucent White
      backdropFilter: 'blur(12px)', // Glass Effect
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between', // Align items to space-between
      alignItems: 'center'
    }}>
      {/* Page Title - Added marginLeft to clear Hamburger Menu */}
      <div style={{ marginLeft: '3rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          {pageTitle}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.625rem 1rem 0.625rem 2.5rem',
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              outline: 'none',
              width: '280px',
              fontSize: '0.875rem',
              color: '#1e293b',
              backgroundColor: 'white'
            }}
          />
        </div>

        {/* Notification */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={20} color="#475569" />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-1px',
            width: '8px',
            height: '8px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            border: '2px solid #ecfdf5'
          }} />
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }}></div>

        {/* Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>
          <span style={{ color: '#94a3b8' }}>Today:</span> {today}
        </div>

        {/* User Profile Info with Dropdown */}
        <div
          style={{ position: 'relative', marginLeft: '0.5rem' }}
          onMouseEnter={() => setShowProfileMenu(true)}
          onMouseLeave={() => setShowProfileMenu(false)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#15803d',
              fontWeight: 700,
              border: '1px solid #dcfce7'
            }}>
              {user?.name ? user.name[0] : 'A'}
            </div>
          </div>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5rem',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e2e8f0',
              padding: '0.5rem',
              minWidth: '150px',
              zIndex: 100
            }}>
              <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.25rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{user?.name || 'Admin'}</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  color: '#ef4444',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default AdminTopNav;


