import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, GraduationCap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Footer() {
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const handleNavigation = (path, hash) => {
    const mainContainer = document.querySelector('main');

    if (location.pathname !== path) {
      navigate(path + (hash ? '#' + hash : ''));
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: 'instant' }); // Immediate scroll for new page
      }
    } else {
      // If already on the page, smooth scroll to id or top
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        if (mainContainer) {
          mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  };

  const adminLinks = [
    { label: 'Dashboard', action: () => handleNavigation('/admin/dashboard') },
    { label: 'Student Leads', action: () => handleNavigation('/admin/leads') },
    { label: 'Applications', action: () => handleNavigation('/admin/applications') },
    { label: 'Reports', action: () => handleNavigation('/admin/reports') }
  ];

  const studentLinks = [
    { label: 'Dashboard', action: () => handleNavigation('/dashboard', 'overview') },
    { label: 'Documents', action: () => handleNavigation('/dashboard', 'documents') },
    { label: 'EMI Calculator', action: () => handleNavigation('/dashboard', 'calculator') }
  ];

  return (
    <footer style={{
      marginTop: 'auto',
      padding: '2rem',
      width: '100%',
      fontFamily: "'Outfit', sans-serif",
    }}>
      {/* Footer Card Container */}
      <div style={{
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 50%, #a7f3d0 100%)', // Mint Gradient
        borderRadius: '1.5rem', // Card Rounded Corners
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // Card Elevation
        color: '#000000', // Black Text request
        padding: '3rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '2rem'
      }}>

        {/* Brand Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '0.5rem',
              borderRadius: '0.75rem',
              display: 'flex',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <GraduationCap size={24} color="#059669" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#000000', letterSpacing: '-0.02em' }}>Kubera</span>
          </div>
          <p style={{ color: '#1f2937', lineHeight: '1.6', marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: 500 }}>
            Seamless financial solutions for your global education journey.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {[
              { Icon: Twitter, link: '#' },
              { Icon: Instagram, link: '#' },
              { Icon: Linkedin, link: '#' },
              { Icon: Facebook, link: '#' }
            ].map(({ Icon, link }, index) => (
              <a
                key={index}
                href={link}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000000',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  e.currentTarget.style.color = '#059669';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                  e.currentTarget.style.color = '#000000';
                }}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#000000' }}>Platform</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {isAdmin ? (
              adminLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.action}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontFamily: 'inherit',
                      color: '#374151',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.color = '#000000'}
                    onMouseLeave={e => e.target.style.color = '#374151'}
                  >
                    {link.label}
                  </button>
                </li>
              ))
            ) : (
              studentLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.action}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontFamily: 'inherit',
                      color: '#374151',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.color = '#000000'}
                    onMouseLeave={e => e.target.style.color = '#374151'}
                  >
                    {link.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#000000' }}>Contact</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#374151', fontWeight: 500 }}>
              <Mail size={18} color="#000000" />
              <span>support@kubera.com</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#374151', fontWeight: 500 }}>
              <Phone size={18} color="#000000" />
              <span>+91 98765 43210</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1.5rem', marginTop: '0.5rem', textAlign: 'center', color: '#4b5563', fontSize: '0.85rem', fontWeight: 500 }}>
          &copy; {year} Kubera Financial Services. All rights reserved.
        </div>

      </div>
    </footer>
  );
}

export default Footer;
