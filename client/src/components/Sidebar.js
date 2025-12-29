import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Users,
  Calculator,
  Upload
} from 'lucide-react';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isAdmin = user?.role === 'admin';
  const isSuperAdmin = user?.role === 'super_admin';
  const isStudent = !isAdmin && !isSuperAdmin;
  const forceCollapsedForStudent = isStudent;
  const sidebarCollapsed = isMobile || forceCollapsedForStudent;

  const adminMenuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/leads', icon: Users, label: 'Student Leads' },
    { path: '/admin/applications', icon: FileText, label: 'Loan Applications' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' }
  ];

  const superAdminMenuItems = [
    { path: '/superadmin/dashboard', icon: Shield, label: 'Super Admin Overview' }
  ];

  const studentMenuItems = [
    { path: '/dashboard', hash: '#overview', icon: LayoutDashboard, label: 'Overview' },
    { path: '/dashboard', hash: '#applications', icon: FileText, label: 'Applications' },
    { path: '/dashboard', hash: '#documents', icon: Upload, label: 'Documents' },
    { path: '/dashboard', hash: '#calculator', icon: Calculator, label: 'EMI Calculator' }
  ];

  const menuItems = isSuperAdmin ? superAdminMenuItems : isAdmin ? adminMenuItems : studentMenuItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (item) => {
    if (isStudent && item.hash) {
      if (location.pathname !== item.path) return false;
      if (!location.hash && item.hash === '#overview') return true;
      return location.hash === item.hash;
    }
    return location.pathname === item.path;
  };

  return (
    <>
      {/* Mobile Menu Button - Light Theme */}
      {/* Mobile Menu Button - Show only when closed */}
      {sidebarCollapsed && !mobileMenuOpen && (
        <button
          onClick={() => setMobileMenuOpen(true)}
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 1201,
            padding: '0.5rem',
            backgroundColor: '#ffffff', // White
            color: '#15803d', // Green Text
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }}
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar - Light Theme */}
      <aside
        style={{
          position: sidebarCollapsed ? 'fixed' : 'static',
          left: 0,
          top: 0,
          width: sidebarCollapsed ? '260px' : '260px',
          height: '100vh',
          backgroundColor: '#ffffff', // White Background (Light Color)
          borderRight: '1px solid #e2e8f0', // Subtle border
          color: '#1e293b', // Dark Slate Text
          padding: '2rem 0',
          zIndex: 1200,
          transform: mobileMenuOpen || !sidebarCollapsed ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          overflowY: 'auto',
          flexShrink: 0,
          flexGrow: 0,
          boxShadow: sidebarCollapsed ? '4px 0 24px rgba(0,0,0,0.05)' : 'none'
        }}
      >
        <div style={{ padding: '0 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#15803d' }}>Kubera</h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
              {isSuperAdmin ? 'Super Admin Portal' : isAdmin ? 'Admin Portal' : 'Loan Portal'}
            </p>
            {user && (
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                {user.name}
              </p>
            )}
          </div>
          {/* Close Button Inside Sidebar */}
          {sidebarCollapsed && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '0.5rem',
                marginRight: '-0.5rem',
                marginTop: '-0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%', // Ensure circular hover
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              aria-label="Close menu"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fee2e2';
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#64748b';
                e.currentTarget.style.transform = 'rotate(0deg)';
              }}
            >
              <X size={24} />
            </button>
          )}
        </div>

        <nav style={{ padding: '0 1rem' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            const target = item.hash ? `${item.path}${item.hash}` : item.path;

            return (
              <Link
                key={item.path}
                to={target}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  // Active: Light Mint BG + Dark Green Text (Clean Style)
                  // Inactive: Transparent BG + Slate Text
                  backgroundColor: active ? '#ecfdf5' : 'transparent',
                  color: active ? '#064e3b' : '#64748b',
                  borderRadius: '0.5rem', // Standard rounded pill
                  boxShadow: 'none',
                  textDecoration: 'none',
                  border: 'none',
                  outline: 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  fontWeight: active ? '600' : '500'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.color = '#0f172a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#64748b';
                  }
                }}
              >
                <Icon size={20} style={{ marginRight: '0.75rem' }} />
                <span style={{ fontSize: '0.9375rem' }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', marginTop: 'auto' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#ef4444', // Red-500
              cursor: 'pointer',
              fontSize: '0.9375rem',
              transition: 'background-color 0.2s',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fef2f2'; // Red-50
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut size={20} style={{ marginRight: '0.75rem' }} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && sidebarCollapsed && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)', // Blurred Background Effect
            zIndex: 999
          }}
        />
      )}
    </>
  );
}

export default Sidebar;
