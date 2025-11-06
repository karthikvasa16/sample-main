import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import apiClient from '../config/axios';
import { CheckCircle, XCircle, Mail, Loader, ArrowLeft } from 'lucide-react';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const verifyEmail = useCallback(async (verificationToken) => {
    try {
      const response = await apiClient.post('/api/auth/verify-email', {
        token: verificationToken
      });

      if (response.data.valid && response.data.success) {
        setVerified(true);
        setMessage(response.data.message || 'Email verified successfully! Please login to continue.');

        // Don't auto-login - redirect to login page instead
        // User needs to login manually after verification
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Email verified successfully! Please login to access your dashboard.',
              verified: true
            } 
          });
        }, 2000);
      } else {
        setVerified(false);
        setError(response.data.error || 'Verification failed');
      }
    } catch (err) {
      setVerified(false);
      setError(err.response?.data?.error || 'Failed to verify email. The link may have expired.');
    } finally {
      setVerifying(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setVerifying(false);
      setError('No verification token provided');
    }
  }, [token, verifyEmail]);

  const handleResendEmail = async () => {
    // You'll need to get the email from somewhere - maybe from localStorage or ask user
    setMessage('Please log in to resend verification email.');
  };

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
        borderRadius: '1.5rem',
        padding: '3rem',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        textAlign: 'center'
      }}>
        {verifying ? (
          <>
            <Loader size={60} style={{ margin: '0 auto 2rem', color: '#667eea', animation: 'spin 2s linear infinite' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
              Verifying Your Email...
            </h2>
            <p style={{ color: '#64748b' }}>
              Please wait while we verify your email address.
            </p>
          </>
        ) : verified ? (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem'
            }}>
              <CheckCircle size={40} color="white" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
              Email Verified!
            </h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              {message || 'Your email has been successfully verified. Redirecting to your dashboard...'}
            </p>
            <Link
              to="/dashboard"
              style={{
                display: 'inline-block',
                padding: '0.75rem 2rem',
                backgroundColor: '#667eea',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              Go to Dashboard
            </Link>
          </>
        ) : (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem'
            }}>
              <XCircle size={40} color="white" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
              Verification Failed
            </h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              {error || 'The verification link is invalid or has expired.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={handleResendEmail}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Mail size={20} />
                Resend Verification Email
              </button>
              <Link
                to="/login"
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <ArrowLeft size={18} />
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default VerifyEmail;
