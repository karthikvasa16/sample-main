import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CreditCard, DollarSign, TrendingUp, Send, Trash2 } from 'lucide-react';
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
  const [showCibilCheck, setShowCibilCheck] = useState(false);
  const [showLoanSelector, setShowLoanSelector] = useState(false);
  const [cibilScore, setCibilScore] = useState(null);
  const [loanApplications, setLoanApplications] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleCibilScoreFetched = (scoreData) => {
    setCibilScore(scoreData);
    setShowCibilCheck(false);
    if (scoreData.eligibility) {
      setShowLoanSelector(true);
    }
  };

  const handleLoanSubmit = async (loanData) => {
    try {
      const response = await axios.post('/api/loans/apply', {
        ...loanData,
        cibilScore: cibilScore.score,
        pan: cibilScore.pan
      });

      if (response.data.success) {
        setShowLoanSelector(false);
        setCibilScore(null);
        // Refresh applications
        fetchApplications();
      }
    } catch (error) {
      console.error('Loan application error:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await axios.get('/api/loans/my-applications');
      setLoanApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
            Loan Application Dashboard
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            Check your CIBIL score and apply for educational loans
          </p>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#fecaca';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#fee2e2';
          }}
        >
          <Trash2 size={18} />
          Delete Account
        </button>
      </div>

      {/* CIBIL Score Check Card */}
      {!cibilScore && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#667eea15',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <CreditCard size={40} style={{ color: '#667eea' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
            Check Your CIBIL Score
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Verify your credit score to check loan eligibility and available loan amounts.
          </p>
          <button
            onClick={() => setShowCibilCheck(true)}
            style={{
              padding: '0.875rem 2rem',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#5568d3';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#667eea';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <TrendingUp size={20} />
            Check CIBIL Score
          </button>
        </div>
      )}

      {/* CIBIL Score Display */}
      {cibilScore && !showLoanSelector && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                Your CIBIL Score
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>PAN: {cibilScore.pan}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: cibilScore.score >= 750 ? '#10b981' : cibilScore.score >= 650 ? '#3b82f6' : '#f59e0b'
              }}>
                {cibilScore.score}
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{cibilScore.status}</p>
            </div>
          </div>
          
          {cibilScore.eligibility && (
            <button
              onClick={() => setShowLoanSelector(true)}
              style={{
                width: '100%',
                padding: '0.875rem',
                backgroundColor: '#10b981',
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
              <DollarSign size={20} />
              Apply for Loan
            </button>
          )}
        </div>
      )}

      {/* Loan Applications */}
      {loanApplications.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>
            My Loan Applications
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {loanApplications.map((app) => (
              <div key={app.id} style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                      {app.purpose || 'Educational Loan'}
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      ₹{app.amount?.toLocaleString('en-IN')} • {app.duration} months
                    </p>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: app.status === 'Approved' ? '#d1fae5' : app.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                    color: app.status === 'Approved' ? '#065f46' : app.status === 'Pending' ? '#92400e' : '#991b1b'
                  }}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
