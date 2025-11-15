import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Check, X, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TermsModal from '../components/TermsModal';
import PrivacyModal from '../components/PrivacyModal';
import apiClient from '../config/axios';

function PasswordStrengthIndicator({ password }) {
  const getStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;
    return strength;
  };

  const strength = getStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#ef4444', '#f59e0b', '#eab308', '#3b82f6', '#10b981'];

  if (!password) return null;

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '4px',
              backgroundColor: i < strength ? strengthColors[Math.min(strength - 1, 4)] : '#e5e7eb',
              borderRadius: '2px',
              transition: 'background-color 0.3s'
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: strengthColors[Math.min(strength - 1, 4)] }}>
        Password strength: {strengthLabels[Math.min(strength - 1, 4)]}
      </p>
    </div>
  );
}

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const navigate = useNavigate();
  const { loginWithGoogle, register } = useAuth();

  useEffect(() => {
    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setErrors({});
    
    try {
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
              resolve();
            }, 3000);
          }
        });
      };

      await waitForGoogle();

      // Helper function for demo fallback
      const handleDemoGoogleSignUp = async () => {
        const demoEmail = `google.student.${Date.now()}@gmail.com`;
        const result = await loginWithGoogle(
          `google-token-${Date.now()}`,
          'Google Student',
          demoEmail,
          null
        );
        
        if (result.success) {
          setSuccess(true);
          setTimeout(() => {
            navigate('/dashboard', { state: { message: 'Registration successful with Google!' } });
          }, 1500);
        } else {
          setErrors({ submit: 'Google sign-up is currently unavailable. Please use email registration.' });
          setGoogleLoading(false);
        }
      };

      if (window.google && window.google.accounts && window.google.accounts.id) {
        // Initialize Google Sign-In to show account selection
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
          callback: async (response) => {
            setGoogleLoading(true);
            try {
              const payload = JSON.parse(atob(response.credential.split('.')[1]));
              const result = await loginWithGoogle(
                response.credential,
                payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim() || 'User',
                payload.email,
                payload.picture || null
              );
              
              if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                  navigate('/dashboard', { state: { message: 'Registration successful with Google!' } });
                }, 1500);
              } else {
                setErrors({ submit: result.error || 'Google sign-up failed' });
                setGoogleLoading(false);
              }
            } catch (err) {
              console.error('Google auth processing error:', err);
              setErrors({ submit: 'Failed to process Google authentication' });
              setGoogleLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Show account selection popup
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
            // If One Tap doesn't show, trigger the sign-in flow manually
            // Create a temporary button to trigger account selection
            const buttonContainer = document.createElement('div');
            buttonContainer.id = 'temp-google-signin';
            buttonContainer.style.position = 'absolute';
            buttonContainer.style.left = '-9999px';
            document.body.appendChild(buttonContainer);
            
            try {
              window.google.accounts.id.renderButton(
                buttonContainer,
                {
                  type: 'standard',
                  theme: 'outline',
                  size: 'large',
                  text: 'signup_with',
                  shape: 'rectangular'
                }
              );
              
              // Wait a bit for button to render, then click it
              setTimeout(() => {
                const button = buttonContainer.querySelector('div[role="button"]');
                if (button) {
                  button.click();
                } else {
                  // Fallback: use demo
                  handleDemoGoogleSignUp();
                }
                // Clean up
                setTimeout(() => {
                  if (buttonContainer.parentNode) {
                    buttonContainer.parentNode.removeChild(buttonContainer);
                  }
                }, 1000);
              }, 500);
            } catch (err) {
              console.error('Error rendering button:', err);
              handleDemoGoogleSignUp();
              if (buttonContainer.parentNode) {
                buttonContainer.parentNode.removeChild(buttonContainer);
              }
            }
          }
        });
      } else {
        // Fallback: Direct demo implementation
        await handleDemoGoogleSignUp();
      }
    } catch (err) {
      console.error('Google sign-up error:', err);
      setErrors({ submit: 'Google sign-up is currently unavailable. Please use email registration.' });
      setGoogleLoading(false);
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^[\d\s\-+()]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Check if email already exists
  const checkEmailExists = async (email) => {
    if (!email || !validateEmail(email)) {
      return false;
    }

    try {
      const response = await apiClient.post('/api/auth/check-email', { email });
      return response.data.exists;
    } catch (error) {
      // If endpoint doesn't exist or error, return false (will be caught on registration)
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        country: formData.country || undefined
      });

      if (result.success) {
        // Show success view with email address
        setSuccess(true);
        setUserEmail(formData.email);
        setLoading(false);
        // Don't redirect - user stays on registration page but with success view
      } else {
        console.error('Registration failed:', result.error);
        setErrors({
          submit: result.error || 'Registration failed. Please try again.'
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Registration exception:', error);
      setErrors({
        submit: error.message || 'An unexpected error occurred. Please try again.'
      });
      setLoading(false);
    }
  };

  // Show success view when email is sent successfully
  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '3rem',
          width: '100%',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            animation: 'scaleIn 0.3s ease-out'
          }}>
            <Check size={40} color="white" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
            Verification Email Sent!
          </h2>
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f0f9ff',
            borderRadius: '0.75rem',
            border: '1px solid #bae6fd',
            marginBottom: '1.5rem'
          }}>
            <p style={{ color: '#64748b', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              Verification mail has been sent to
            </p>
            <p style={{ 
              color: '#667eea', 
              fontWeight: '600', 
              fontSize: '1.1rem',
              wordBreak: 'break-word'
            }}>
              {userEmail}
            </p>
          </div>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Please check your email inbox and click on the verification link to activate your account.
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Didn't receive the email? Check your spam folder or request a new verification link.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setUserEmail('');
              setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                phone: '',
                country: '',
                acceptTerms: false
              });
              setErrors({});
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#5568d3';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#667eea';
            }}
          >
            Register Another Account
          </button>
        </div>
      </div>
    );
  }

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
        top: '-50%',
        right: '-50%',
        width: '1000px',
        height: '1000px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'pulse 20s ease-in-out infinite'
      }} />
      
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1.5rem',
        padding: '3rem',
        width: '100%',
        maxWidth: '600px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#667eea',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <User size={30} color="white" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
            Create Account
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Register to apply for educational loans and manage your applications
          </p>
        </div>

        {errors.submit && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <X size={20} />
            <span>{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {/* Full Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500', fontSize: '0.875rem' }}>
                Full Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    border: errors.name ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    if (!errors.name) e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.name ? '#ef4444' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              {errors.name && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500', fontSize: '0.875rem' }}>
                Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    border: errors.email ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    if (!errors.email) e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={async (e) => {
                    e.target.style.borderColor = errors.email ? '#ef4444' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                    
                    // Check if email already exists when user leaves the field
                    if (formData.email.trim() && validateEmail(formData.email)) {
                      const emailExists = await checkEmailExists(formData.email);
                      if (emailExists) {
                        setErrors(prev => ({
                          ...prev,
                          email: 'We already have a user with this email. Please use a different email address or try logging in.'
                        }));
                      }
                    }
                  }}
                />
              </div>
              {errors.email && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.email}</p>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {/* Phone */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500', fontSize: '0.875rem' }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    border: errors.phone ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    if (!errors.phone) e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.phone ? '#ef4444' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              {errors.phone && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.phone}</p>
              )}
            </div>

          </div>

          {/* Password */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500', fontSize: '0.875rem' }}>
              Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  paddingRight: '3rem',
                  border: errors.password ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  if (!errors.password) e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.password ? '#ef4444' : '#d1d5db';
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
                  padding: '0.25rem'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.password && <PasswordStrengthIndicator password={formData.password} />}
            {errors.password && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500', fontSize: '0.875rem' }}>
              Confirm Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  paddingRight: '3rem',
                  border: errors.confirmPassword ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  if (!errors.confirmPassword) e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.confirmPassword ? '#ef4444' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  padding: '0.25rem'
                }}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p style={{ color: '#10b981', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Check size={14} /> Passwords match
              </p>
            )}
            {errors.confirmPassword && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', color: '#374151' }}>
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                style={{
                  marginRight: '0.75rem',
                  marginTop: '0.25rem',
                  cursor: 'pointer',
                  width: '18px',
                  height: '18px',
                  accentColor: '#667eea'
                }}
              />
              <span style={{ fontSize: '0.875rem' }}>
                I agree to the{' '}
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
                    fontWeight: 'inherit'
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
                    fontWeight: 'inherit'
                  }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  Privacy Policy
                </button>
              </span>
            </label>
            {errors.acceptTerms && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem', marginLeft: '1.75rem' }}>{errors.acceptTerms}</p>
            )}
          </div>

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

          {/* Google Sign Up Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
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
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              marginBottom: '1rem'
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
                Signing up with Google...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </>
            )}
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            style={{
              width: '100%',
              padding: '0.875rem',
              backgroundColor: loading || googleLoading ? '#9ca3af' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading || googleLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: loading || googleLoading ? 'none' : '0 4px 6px -1px rgba(102, 126, 234, 0.3)',
              marginBottom: '1.5rem'
            }}
            onMouseEnter={(e) => {
              if (!loading && !googleLoading) {
                e.target.style.backgroundColor = '#5568d3';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 12px -2px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !googleLoading) {
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
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Login Link */}
          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
            <p>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.5; }
          50% { transform: scale(1.1) translate(20px, -20px); opacity: 0.3; }
        }
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
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

export default Register;

