import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, Bell, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import apiClient from '../config/axios';

function AdminTopNav() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // Helper for formatting relative time
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const [profileForm, setProfileForm] = useState({ name: '', password: '', confirmPassword: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Initialize form when user data changes or modal opens
  React.useEffect(() => {
    if (user) {
      setProfileForm(prev => ({ ...prev, name: user.name || '' }));
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    setProfileLoading(true);
    try {
      await apiClient.put('/api/auth/profile', {
        name: profileForm.name,
        password: profileForm.password || undefined
      });

      setShowProfileMenu(false);
      setProfileForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
      window.location.reload();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch notifications
  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await apiClient.get('/api/admin/notifications');
        if (response.data && response.data.notifications) {
          setNotifications(response.data.notifications);
          setUnreadCount(response.data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    if (user?.role === 'admin' || user?.role === 'super_admin') {
      fetchNotifications();
    }
  }, [user]);

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
    window.location.href = '/login';
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.85)', // Translucent White
      backdropFilter: 'blur(12px)', // Glass Effect
      borderBottom: '2px solid #6ee7b7', // Light mint green
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      padding: '1rem 2rem 1rem 5rem', // Match Student Dashboard padding
      display: 'flex',
      justifyContent: 'space-between', // Align items to space-between
      alignItems: 'center', // Ensure vertical alignment is center
      zIndex: 50 // Keep on top of content
    }}>
      {/* Page Title */}
      <div>
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
              border: '2px solid #6ee7b7', // Light mint green
              outline: 'none',
              width: '280px',
              fontSize: '0.875rem',
              color: '#1e293b',
              backgroundColor: 'white'
            }}
          />
        </div>

        {/* Notification */}
        <div
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell size={20} color="#475569" />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 700,
              minWidth: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #ecfdf5'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '120%',
              right: '-10px', // Align slightly right to not be cut off
              width: '320px',
              backgroundColor: 'white',
              borderRadius: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              zIndex: 100,
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Notifications</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {notifications.length > 0 ? (
                  notifications.slice(0, 6).map((notif, index) => (
                    <div key={index} style={{
                      padding: '1rem 1.25rem',
                      borderBottom: '1px solid #f8fafc',
                      transition: 'background-color 0.2s',
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <p style={{ fontSize: '0.875rem', color: '#334155', margin: '0 0 0.25rem 0', lineHeight: 1.4 }}>{notif.message}</p>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>{timeAgo(notif.timestamp)}</p>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                    No new notifications
                  </div>
                )}
              </div>
              <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: '#15803d',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }}></div>

        {/* Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>
          <span style={{ color: '#94a3b8' }}>Today:</span> {today}
        </div>

        {/* User Profile Info with Dropdown */}
        <div
          style={{ position: 'relative', marginLeft: '0.5rem' }}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
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

          {/* Profile Modal - Using Portal */}
          {showProfileMenu && createPortal(
            <>
              {/* Backdrop Blur */}
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 999
                }}
                onClick={() => setShowProfileMenu(false)}
              />

              {/* Menu - Centered Modal */}
              <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'white',
                borderRadius: '1.5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid #e2e8f0',
                padding: '2rem',
                width: '100%',
                maxWidth: '450px',
                zIndex: 1000,
                maxHeight: '90vh', // Prevent overflow on small screens
                overflowY: 'auto',
                animation: 'scaleUp 0.2s ease-out'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                    Edit Profile
                  </h2>
                  <button
                    onClick={() => setShowProfileMenu(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fee2e2';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#64748b';
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleProfileUpdate}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #d1d5db',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#10b981'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                      New Password (optional)
                    </label>
                    <input
                      type="password"
                      value={profileForm.password}
                      onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                      placeholder="Leave blank to keep current"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #d1d5db',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#10b981'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      minLength={6}
                    />
                  </div>

                  {profileForm.password && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #d1d5db',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#10b981'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        required
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: '#fee2e2',
                        color: '#ef4444',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#fecaca'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#fee2e2'}
                    >
                      Logout
                    </button>
                    <button
                      type="submit"
                      disabled={profileLoading}
                      style={{
                        flex: 2,
                        padding: '0.75rem',
                        backgroundColor: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        cursor: profileLoading ? 'not-allowed' : 'pointer',
                        opacity: profileLoading ? 0.7 : 1,
                        boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => !profileLoading && (e.target.style.backgroundColor = '#047857')}
                      onMouseLeave={(e) => !profileLoading && (e.target.style.backgroundColor = '#059669')}
                    >
                      {profileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
              <style>{`
                @keyframes scaleUp {
                  from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
              `}</style>
            </>,
            document.body
          )}
        </div>
      </div>
    </nav>
  );
}

export default AdminTopNav;


