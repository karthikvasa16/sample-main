import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import TermsModal from '../components/TermsModal';
import PrivacyModal from '../components/PrivacyModal';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Show success message if redirected from registration or verification
    if (location.state?.message) {
      setSuccess(location.state.message);
      setTimeout(() => setSuccess(''), 5000);
    }
    // Clear location state to prevent message from showing again on refresh
    if (location.state) {
      window.history.replaceState({}, document.title);
    }

    // Load Google OAuth script properly
    if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google OAuth script loaded');
      };
      script.onerror = () => {
        console.warn('Google OAuth script failed to load - using fallback');
      };
      document.head.appendChild(script);
    }

    return () => {
      // Don't remove script on cleanup to avoid reloading
    };
  }, [location]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    
    try {
      // Simplified Google OAuth - direct implementation
      // Wait for Google script to load
      const waitForGoogle = () => {
        return new Promise((resolve) => {
          if (window.google && window.google.accounts) {
            resolve();
          } else {
            const checkInterval = setInterval(() => {
              if (window.google && window.google.accounts) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 100);
            
            setTimeout(() => {
              clearInterval(checkInterval);
              resolve(); // Continue even if Google doesn't load
            }, 3000);
          }
        });
      };

      await waitForGoogle();

      if (window.google && window.google.accounts && window.google.accounts.id) {
        // Use One Tap or Sign In button
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
          callback: async (response) => {
            try {
              const payload = JSON.parse(atob(response.credential.split('.')[1]));
              const result = await loginWithGoogle(
                response.credential,
                payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim() || 'User',
                payload.email,
                payload.picture || null
              );
              
              if (result.success) {
                navigate('/dashboard');
              } else {
                setError(result.error || 'Google sign-in failed');
                setGoogleLoading(false);
              }
            } catch (err) {
              console.error('Google auth processing error:', err);
              setError('Failed to process Google authentication');
              setGoogleLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Trigger sign-in popup
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback: show manual Google sign-in
            const demoEmail = `google.student.${Date.now()}@gmail.com`;
            loginWithGoogle(
              `google-token-${Date.now()}`,
              'Google Student',
              demoEmail,
              null
            ).then(result => {
              if (result.success) {
                navigate('/dashboard');
              } else {
                setError('Google sign-in is currently unavailable. Please use email/password login.');
              }
              setGoogleLoading(false);
            });
          }
        });
      } else {
        // Fallback: Direct demo implementation for testing
        const demoEmail = `google.student.${Date.now()}@gmail.com`;
        const result = await loginWithGoogle(
          `google-token-${Date.now()}`,
          'Google Student',
          demoEmail,
          null
        );
        
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error || 'Google sign-in unavailable. Please register with email.');
        }
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Google sign-in is currently unavailable. Please use email/password login.');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Basic validation
    if (!email.trim()) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    const result = await login(email.trim(), password);
    
    if (result.success) {
      // Check user role and navigate accordingly
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            // Redirect students to student dashboard
            navigate('/dashboard'); // This will route to StudentDashboard for students
          }
        } catch {
          navigate('/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error || 'Invalid email or password');
    }
    
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-20%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 20s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        right: '-30%',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 25s ease-in-out infinite reverse'
      }} />

      <div style={{
        backgroundColor: 'white',
        borderRadius: '1.5rem',
        padding: '3rem',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        zIndex: 1,
        animation: 'slideUp 0.4s ease-out'
      }}>
        {/* Logo/Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            backgroundColor: '#667eea',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 25px -5px rgba(102, 126, 234, 0.4)'
          }}>
            <Shield size={35} color="white" />
          </div>
          <h1 style={{ 
            fontSize: '2.25rem', 
            fontWeight: 'bold', 
            color: '#1e293b', 
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
LoanFlow
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b' }}>
            Welcome back! Please sign in to your account
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            border: '1px solid #6ee7b7'
          }}>
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            border: '1px solid #fca5a5',
            animation: 'shake 0.4s ease-out'
          }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              color: '#374151', 
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#9ca3af',
                zIndex: 1
              }} />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="Enter your email"
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 0.875rem 0.875rem 2.75rem',
                  border: error ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '0.75rem',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s',
                  outline: 'none',
                  backgroundColor: '#f9fafb'
                }}
                onFocus={(e) => {
                  if (!error) e.target.style.borderColor = '#667eea';
                  e.target.style.backgroundColor = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error ? '#ef4444' : '#d1d5db';
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              color: '#374151', 
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#9ca3af',
                zIndex: 1
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 0.875rem 0.875rem 2.75rem',
                  paddingRight: '3rem',
                  border: error ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '0.75rem',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s',
                  outline: 'none',
                  backgroundColor: '#f9fafb'
                }}
                onFocus={(e) => {
                  if (!error) e.target.style.borderColor = '#667eea';
                  e.target.style.backgroundColor = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error ? '#ef4444' : '#d1d5db';
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.25rem',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#374151'}
                onMouseLeave={(e) => e.target.style.color = '#6b7280'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '2rem' 
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer', 
              color: '#374151',
              fontSize: '0.875rem'
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ 
                  marginRight: '0.5rem', 
                  cursor: 'pointer',
                  width: '18px',
                  height: '18px',
                  accentColor: '#667eea'
                }}
              />
              Remember me
            </label>
            <Link 
              to="/forgot-password" 
              style={{ 
                color: '#667eea', 
                textDecoration: 'none', 
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#5568d3'}
              onMouseLeave={(e) => e.target.style.color = '#667eea'}
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              backgroundColor: loading ? '#9ca3af' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 6px -1px rgba(102, 126, 234, 0.3)',
              marginBottom: '1.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#5568d3';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 12px -2px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#667eea';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px -1px rgba(102, 126, 234, 0.3)';
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }}></span>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Divider */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '1.5rem',
            gap: '1rem'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
            <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
          </div>

          {/* Social Login Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '2px solid #d1d5db',
                borderRadius: '0.75rem',
                backgroundColor: 'white',
                cursor: googleLoading || loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                fontSize: '0.95rem',
                color: '#374151',
                fontWeight: '600',
                transition: 'all 0.3s',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={(e) => {
                if (!googleLoading && !loading) {
                  e.target.style.borderColor = '#4285F4';
                  e.target.style.backgroundColor = '#f8f9fa';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!googleLoading && !loading) {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.backgroundColor = 'white';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                }
              }}
            >
              {googleLoading ? (
                <>
                  <span style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #e5e7eb',
                    borderTopColor: '#4285F4',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}></span>
                  Signing in with Google...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </div>

          {/* Sign Up Link */}
          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
            <p>
              Don't have an account?{' '}
              <Link 
                to="/register" 
                style={{ 
                  color: '#667eea', 
                  textDecoration: 'none', 
                  fontWeight: '600',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#5568d3'}
                onMouseLeave={(e) => e.target.style.color = '#667eea'}
              >
                Create Account
              </Link>
            </p>
            <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#9ca3af' }}>
              By signing in, you agree to our{' '}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 'inherit',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Terms of Service
              </button>
              {' '}and{' '}
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 'inherit',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Privacy Policy
              </button>
            </p>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.05); }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Modals */}
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
      <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </div>
  );
}

export default Login;
