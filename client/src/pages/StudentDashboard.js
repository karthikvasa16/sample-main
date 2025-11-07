import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Send,
  Trash2,
  Sparkles,
  Compass,
  Calendar,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Clock,
  RefreshCcw
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DeleteAccountModal from '../components/DeleteAccountModal';

function CibilScoreCheck({ onScoreFetched, onClose }) {
  const [panNumber, setPanNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cibilScore, setCibilScore] = useState(null);

  const validatePAN = (pan) => {
    // PAN format: ABCDE1234F (5 letters, 4 digits, 1 letter)
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!panNumber.trim()) {
      setError('Please enter your PAN number');
      return;
    }

    const panUpper = panNumber.trim().toUpperCase();
    if (!validatePAN(panUpper)) {
      setError('Invalid PAN format. Format: ABCDE1234F');
      return;
    }

    setLoading(true);
    
    try {
      // Call backend API to fetch CIBIL score
      const response = await axios.post('/api/cibil/check', {
        pan: panUpper
      });
      
      if (response.data.success) {
        setCibilScore({
          score: response.data.score,
          pan: response.data.pan,
          status: response.data.status,
          eligibility: response.data.eligibility
        });
        
        if (onScoreFetched) {
          onScoreFetched({
            score: response.data.score,
            pan: response.data.pan,
            status: response.data.status,
            eligibility: response.data.eligibility
          });
        }
      } else {
        setError(response.data.error || 'Failed to fetch CIBIL score');
      }
    } catch (err) {
      console.error('CIBIL score fetch error:', err);
      setError(err.response?.data?.error || 'Failed to fetch CIBIL score. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cibilScore) {
    const scoreColor = cibilScore.score >= 750 ? '#10b981' : cibilScore.score >= 650 ? '#3b82f6' : cibilScore.score >= 550 ? '#f59e0b' : '#ef4444';
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: `${scoreColor}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <TrendingUp size={40} style={{ color: scoreColor }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              Your CIBIL Score
            </h2>
            <div style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: scoreColor,
              marginBottom: '0.5rem'
            }}>
              {cibilScore.score}
            </div>
            <p style={{
              padding: '0.5rem 1rem',
              backgroundColor: `${scoreColor}15`,
              color: scoreColor,
              borderRadius: '0.5rem',
              display: 'inline-block',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              {cibilScore.status}
            </p>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              PAN: {cibilScore.pan}
            </p>
          </div>
          
          {cibilScore.eligibility ? (
            <div style={{
              padding: '1rem',
              backgroundColor: '#d1fae5',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              border: '1px solid #6ee7b7'
            }}>
              <p style={{ color: '#065f46', fontWeight: '600', marginBottom: '0.25rem' }}>
                ✓ You are eligible for educational loans!
              </p>
              <p style={{ color: '#047857', fontSize: '0.875rem' }}>
                Proceed to select your loan amount.
              </p>
            </div>
          ) : (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fef3c7',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              border: '1px solid #fde68a'
            }}>
              <p style={{ color: '#92400e', fontWeight: '600' }}>
                ⚠ Your CIBIL score needs improvement for loan eligibility.
              </p>
            </div>
          )}
          
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '0.875rem',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#5568d3'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
          Check Your CIBIL Score
        </h2>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Enter your PAN number to check your credit score and loan eligibility.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
              PAN Number
            </label>
            <input
              type="text"
              value={panNumber}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
                setPanNumber(value);
                setError('');
              }}
              placeholder="ABCDE1234F"
              style={{
                width: '100%',
                padding: '0.875rem',
                border: error ? '2px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                letterSpacing: '0.1em'
              }}
            />
            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>
            )}
            <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Format: ABCDE1234F (5 letters, 4 digits, 1 letter)
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.875rem',
                backgroundColor: loading ? '#9ca3af' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Checking...' : 'Check Score'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoanAmountSelector({ cibilScore, onSubmit, onCancel }) {
  const [loanAmount, setLoanAmount] = useState(50000);
  const [purpose, setPurpose] = useState('');
  const [duration, setDuration] = useState(12);
  
  const minAmount = 10000;
  const maxAmount = cibilScore?.score >= 750 ? 2000000 : cibilScore?.score >= 650 ? 1000000 : 500000;
  const step = 5000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        amount: loanAmount,
        purpose,
        duration,
        cibilScore: cibilScore.score
      });
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
          Select Loan Amount
        </h2>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Based on your CIBIL score of <strong>{cibilScore?.score}</strong>, you can apply for up to {formatAmount(maxAmount)}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ color: '#374151', fontWeight: '600', fontSize: '1.125rem' }}>
                Loan Amount
              </label>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#667eea'
              }}>
                {formatAmount(loanAmount)}
              </div>
            </div>
            
            <input
              type="range"
              min={minAmount}
              max={maxAmount}
              step={step}
              value={loanAmount}
              onChange={(e) => setLoanAmount(parseInt(e.target.value))}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                background: 'linear-gradient(to right, #667eea 0%, #764ba2 100%)',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
              <span>{formatAmount(minAmount)}</span>
              <span>{formatAmount(maxAmount)}</span>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
              Loan Purpose
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            >
              <option value="">Select purpose</option>
              <option value="tuition">Tuition Fees</option>
              <option value="living">Living Expenses</option>
              <option value="books">Books & Supplies</option>
              <option value="equipment">Equipment & Technology</option>
              <option value="other">Other Educational Expenses</option>
            </select>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
              Loan Duration (Months)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            >
              <option value={12}>12 Months</option>
              <option value={24}>24 Months</option>
              <option value={36}>36 Months</option>
              <option value={48}>48 Months</option>
              <option value={60}>60 Months</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.875rem',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Send size={20} />
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StudentDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [showCibilCheck, setShowCibilCheck] = useState(false);
  const [showLoanSelector, setShowLoanSelector] = useState(false);
  const [cibilScore, setCibilScore] = useState(null);
  const [loanApplications, setLoanApplications] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const firstName = useMemo(() => {
    if (!user?.name) return 'Scholar';
    return user.name.split(' ')[0];
  }, [user?.name]);

  const openCibilModal = useCallback(() => setShowCibilCheck(true), []);

  const openLoanSelector = useCallback(() => {
    if (cibilScore?.eligibility) {
      setShowLoanSelector(true);
    } else {
      setShowCibilCheck(true);
    }
  }, [cibilScore]);

  const handleCibilScoreFetched = useCallback((scoreData) => {
    setCibilScore(scoreData);
    setShowCibilCheck(false);
    if (scoreData.eligibility) {
      setShowLoanSelector(true);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      const response = await axios.get('/api/loans/my-applications');
      setLoanApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  }, []);

  const handleLoanSubmit = useCallback(async (loanData) => {
    try {
      const response = await axios.post('/api/loans/apply', {
        ...loanData,
        cibilScore: cibilScore.score,
        pan: cibilScore.pan
      });

      if (response.data.success) {
        setShowLoanSelector(false);
        setCibilScore(null);
        fetchApplications();
      }
    } catch (error) {
      console.error('Loan application error:', error);
    }
  }, [cibilScore, fetchApplications]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location.hash]);

  const sortedApplications = useMemo(() => {
    if (!loanApplications.length) return [];
    return [...loanApplications].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [loanApplications]);

  const progressHighlights = useMemo(() => {
    const eligibilityStatus = cibilScore
      ? { label: 'CIBIL score', value: `${cibilScore.score} pts`, accent: cibilScore.score >= 750 ? '#22c55e' : '#f97316' }
      : { label: 'CIBIL score', value: 'Pending', accent: '#f97316' };
    const applicationsStatus = sortedApplications.length
      ? { label: 'Loan applications', value: `${sortedApplications.length} submitted`, accent: '#38bdf8' }
      : { label: 'Loan applications', value: 'Not started', accent: '#38bdf8' };
    const verificationStatus = {
      label: 'Account status',
      value: 'Email verified',
      accent: '#a855f7'
    };

    return [eligibilityStatus, applicationsStatus, verificationStatus];
  }, [cibilScore, sortedApplications.length]);

  const journeySteps = useMemo(() => [
    {
      title: 'Discover your credit readiness',
      description: 'Unlock personalised loan options by understanding your CIBIL story.',
      completed: !!cibilScore,
      actionLabel: cibilScore ? 'View score' : 'Check now',
      onAction: openCibilModal
    },
    {
      title: 'Tailor your dream loan',
      description: 'Play with loan amounts, durations, and EMI before you submit.',
      completed: sortedApplications.length > 0,
      actionLabel: 'Design my plan',
      onAction: openLoanSelector
    },
    {
      title: 'Track approval journey',
      description: 'Stay informed from submission to disbursement—every milestone in one place.',
      completed: sortedApplications.some((app) => app.status === 'Approved'),
      actionLabel: 'See timeline',
      onAction: fetchApplications
    }
  ], [cibilScore, sortedApplications, openCibilModal, openLoanSelector, fetchApplications]);

  const recommendedResources = useMemo(() => [
    {
      title: 'Scholarship handbook 2025',
      preview: '40+ verified scholarships curated for STEM, business, and creative programs.',
      icon: BookOpen,
      accent: '#60a5fa'
    },
    {
      title: 'Visa timeline planner',
      preview: 'Plan document submissions, visa slots, and travel with confidence.',
      icon: Calendar,
      accent: '#facc15'
    },
    {
      title: 'Financial wellness toolkit',
      preview: 'Budget templates, credit boosters, and repayment playbooks for students abroad.',
      icon: Compass,
      accent: '#34d399'
    }
  ], []);

  const inspirationQuote = useMemo(() => ({
    quote: '“The future belongs to those who believe in the beauty of their dreams.”',
    author: 'Eleanor Roosevelt',
    context: 'Every application you submit today becomes tomorrow’s success story.'
  }), []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #eef2ff 0%, #f8fafc 40%, #ffffff 100%)',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(129, 140, 248, 0.12), transparent 40%), radial-gradient(circle at 80% 0%, rgba(34, 211, 238, 0.12), transparent 45%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2.5rem 2rem 4rem',
        position: 'relative',
        zIndex: 1
      }}>
        <section id="overview" style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #22d3ee 100%)',
          borderRadius: '1.75rem',
          padding: '2.75rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 30px 60px -40px rgba(15, 23, 42, 0.6)',
          marginBottom: '2.5rem'
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8), transparent 30%)' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ maxWidth: '620px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.45rem 1rem', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.14)', fontWeight: 600 }}>
                <Sparkles size={18} />
                <span>Welcome back, {firstName}</span>
              </div>
              <div>
                <h1 style={{ fontSize: '2.75rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '0.75rem' }}>
                  Your education journey deserves bold funding.
                </h1>
                <p style={{ fontSize: '1.1rem', maxWidth: '560px', color: 'rgba(255,255,255,0.85)' }}>
                  Move from dream to destination with a personalised credit plan, curated resources, and a dashboard that cheers every milestone.
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  onClick={openCibilModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.9rem 1.6rem',
                    borderRadius: '0.85rem',
                    border: 'none',
                    backgroundColor: 'white',
                    color: '#312e81',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 12px 24px -14px rgba(15, 23, 42, 0.45)'
                  }}
                >
                  <TrendingUp size={18} />
                  Start with CIBIL
                </button>
                <button
                  onClick={openLoanSelector}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.9rem 1.5rem',
                    borderRadius: '0.85rem',
                    border: '1px solid rgba(255,255,255,0.4)',
                    backgroundColor: 'transparent',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Compass size={18} />
                  Continue journey
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                {progressHighlights.map((item) => (
                  <div key={item.label} style={{
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    borderRadius: '1rem',
                    padding: '0.9rem 1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{item.label}</span>
                    <span style={{ fontWeight: 600, color: item.accent }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                padding: '0.65rem 1.1rem',
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.85)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <Trash2 size={16} />
              Manage account
            </button>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem', marginBottom: '2.75rem' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1.5rem',
            padding: '1.75rem',
            boxShadow: '0 20px 40px -28px rgba(15, 23, 42, 0.25)',
            border: '1px solid rgba(226, 232, 240, 0.6)'
          }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.25rem' }}>Your momentum plan</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {journeySteps.map((step, index) => (
                <div key={step.title} style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: '1rem',
                  backgroundColor: step.completed ? '#f0fdf4' : '#f8fafc',
                  border: step.completed ? '1px solid #bbf7d0' : '1px solid rgba(226, 232, 240, 0.8)'
                }}>
                  <div style={{
                    width: '2.25rem',
                    height: '2.25rem',
                    borderRadius: '0.8rem',
                    backgroundColor: step.completed ? '#22c55e1a' : '#e0e7ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {step.completed ? <CheckCircle size={18} color="#16a34a" /> : <span style={{ fontWeight: 600, color: '#4c1d95' }}>{index + 1}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>{step.title}</h3>
                      <button
                        onClick={step.onAction}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.8rem',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '0.6rem',
                          border: 'none',
                          backgroundColor: step.completed ? '#16a34a' : '#4f46e5',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        {step.actionLabel}
                        <ArrowRight size={14} />
                      </button>
                    </div>
                    <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '0.4rem' }}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            backgroundColor: '#0f172a',
            color: 'white',
            borderRadius: '1.5rem',
            padding: '1.75rem',
            boxShadow: '0 20px 40px -28px rgba(15, 23, 42, 0.4)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'radial-gradient(circle at 30% 10%, rgba(255,255,255,0.4), transparent 55%)' }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.12)', fontSize: '0.75rem', fontWeight: 500 }}>
                <Clock size={14} />
                Weekly motivation
              </div>
              <p style={{ fontSize: '1.35rem', lineHeight: 1.5, fontWeight: 600 }}>
                {inspirationQuote.quote}
              </p>
              <div>
                <p style={{ fontWeight: 600 }}>{inspirationQuote.author}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginTop: '0.35rem' }}>{inspirationQuote.context}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="resources" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {(!cibilScore || showLoanSelector) ? (
            <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '1.75rem', boxShadow: '0 20px 40px -28px rgba(15, 23, 42, 0.25)', border: '1px solid rgba(226,232,240,0.6)', textAlign: 'left' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '1.25rem',
                backgroundColor: '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <CreditCard size={34} color="#4f46e5" />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.6rem' }}>Start with a confident credit snapshot</h2>
              <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                Unlock real-time insights into your borrowing potential and tailor a loan that fits your study plan perfectly.
              </p>
              <button
                onClick={openCibilModal}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.4rem',
                  borderRadius: '0.9rem',
                  border: 'none',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <TrendingUp size={18} />
                Check my score
              </button>
            </div>
          ) : (
            <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '1.75rem', boxShadow: '0 20px 40px -28px rgba(15, 23, 42, 0.25)', border: '1px solid rgba(226,232,240,0.6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#1f2937' }}>Your credit summary</h2>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>PAN: {cibilScore.pan}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2.25rem', fontWeight: 700, color: cibilScore.score >= 750 ? '#16a34a' : cibilScore.score >= 650 ? '#2563eb' : '#f59e0b' }}>{cibilScore.score}</div>
                  <p style={{ color: '#475569', fontSize: '0.9rem' }}>{cibilScore.status}</p>
                </div>
              </div>
              <div style={{ padding: '1rem', borderRadius: '1rem', backgroundColor: cibilScore.eligibility ? '#ecfdf5' : '#fef3c7', border: cibilScore.eligibility ? '1px solid #d1fae5' : '1px solid #fde68a', marginBottom: '1.5rem' }}>
                <p style={{ color: cibilScore.eligibility ? '#047857' : '#92400e', fontWeight: 600 }}>
                  {cibilScore.eligibility ? 'You are eligible for a premium education loan.' : 'Let’s build your credit profile to unlock better offers.'}
                </p>
              </div>
              {cibilScore.eligibility && (
                <button
                  onClick={() => setShowLoanSelector(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.85rem 1.4rem',
                    borderRadius: '0.9rem',
                    border: 'none',
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <DollarSign size={18} />
                  Craft my loan
                </button>
              )}
            </div>
          )}

          <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '1.75rem', boxShadow: '0 20px 40px -28px rgba(15, 23, 42, 0.25)', border: '1px solid rgba(226,232,240,0.6)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.25rem' }}>Curated for ambitious learners</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {recommendedResources.map((resource) => (
                <div key={resource.title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '2.75rem',
                    height: '2.75rem',
                    borderRadius: '0.9rem',
                    backgroundColor: resource.accent + '26',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <resource.icon size={18} color={resource.accent} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '0.35rem' }}>{resource.title}</h3>
                    <p style={{ color: '#475569', fontSize: '0.9rem' }}>{resource.preview}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="applications" style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a' }}>Your loan portfolio</h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Real-time updates on every application you have submitted.</p>
            </div>
            <button
              onClick={fetchApplications}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid #cbd5f5',
                backgroundColor: 'white',
                color: '#4f46e5',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCcw size={16} /> Refresh status
            </button>
          </div>
          {sortedApplications.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1.5rem',
              padding: '2rem',
              textAlign: 'center',
              border: '1px solid rgba(226,232,240,0.6)',
              boxShadow: '0 20px 40px -28px rgba(15, 23, 42, 0.18)'
            }}>
              <Compass size={32} color="#6366f1" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>No applications submitted yet</h3>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                Start by checking your credit profile and crafting a tailored loan proposal.
              </p>
              <button
                onClick={openLoanSelector}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.4rem',
                  borderRadius: '0.9rem',
                  border: 'none',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Send size={18} />
                Submit your first application
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {sortedApplications.map((app) => (
                <div key={app.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '1.5rem',
                  padding: '1.75rem',
                  border: '1px solid rgba(226,232,240,0.6)',
                  boxShadow: '0 20px 40px -28px rgba(15, 23, 42, 0.18)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>{app.purpose || 'Educational Loan'}</h3>
                      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.35rem' }}>
                        ₹{app.amount?.toLocaleString('en-IN')} · {app.duration} months
                      </p>
                    </div>
                    <span style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: app.status === 'Approved' ? '#dcfce7' : app.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                      color: app.status === 'Approved' ? '#166534' : app.status === 'Pending' ? '#92400e' : '#991b1b'
                    }}>
                      {app.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#475569', fontSize: '0.85rem' }}>
                    <span>Applied on {new Date(app.createdAt || app.updatedAt || Date.now()).toLocaleDateString()}</span>
                    <span>Score used: {app.cibilScore || cibilScore?.score || '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showCibilCheck && (
        <CibilScoreCheck
          onScoreFetched={handleCibilScoreFetched}
          onClose={() => setShowCibilCheck(false)}
        />
      )}

      {showLoanSelector && cibilScore && (
        <LoanAmountSelector
          cibilScore={cibilScore}
          onSubmit={handleLoanSubmit}
          onCancel={() => {
            setShowLoanSelector(false);
            setCibilScore(null);
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          userEmail={user?.email || ''}
        />
      )}
    </div>
  );
}

export default StudentDashboard;
