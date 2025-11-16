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
  RefreshCcw,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DeleteAccountModal from '../components/DeleteAccountModal';
import LoanDocumentsSection from '../components/LoanDocumentsSection';
import VerificationStatus from '../components/VerificationStatus';
import StudentDocumentsUpload from '../components/StudentDocumentsUpload';

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
    const scoreColor = cibilScore.score >= 750 ? '#22c55e' : cibilScore.score >= 650 ? '#22c55e' : cibilScore.score >= 550 ? '#f59e0b' : '#ef4444';
    
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
                    backgroundColor: loading ? '#9ca3af' : '#22c55e',
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

function LoanApplicationModal({
  isOpen,
  onClose,
  loanIntent,
  onSubmit,
  documentsConfig
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    fullName: '',
    university: '',
    course: '',
    studyCountry: '',
    contactNumber: '',
    coApplicantName: '',
    coApplicantRelation: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [documentMetadata, setDocumentMetadata] = useState({});
  const [documentFiles, setDocumentFiles] = useState({});
  const [documentErrors, setDocumentErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setActiveStep(0);
      setSubmitting(false);
      setFormValues({
        fullName: '',
        university: '',
        course: '',
        studyCountry: '',
        contactNumber: '',
        coApplicantName: '',
        coApplicantRelation: ''
      });
      setFormErrors({});
      setDocumentMetadata({});
      setDocumentFiles({});
      setDocumentErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Profile & admit details',
      description: 'Share your admit facts so we can evaluate your eligibility.',
      validator: () => {
        const errors = {};
        if (!formValues.fullName.trim()) errors.fullName = 'Full name is required';
        if (!formValues.university.trim()) errors.university = 'University is required';
        if (!formValues.course.trim()) errors.course = 'Program name is required';
        if (!formValues.studyCountry.trim()) errors.studyCountry = 'Destination country is required';
        if (!formValues.contactNumber.trim()) {
          errors.contactNumber = 'Contact number is required';
        } else if (!/^\d{10}$/.test(formValues.contactNumber.trim())) {
          errors.contactNumber = 'Enter a valid 10-digit number';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
      },
      content: (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#1e293b', marginBottom: '0.45rem' }}>
              Full name *
            </label>
            <input
              type="text"
              value={formValues.fullName}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, fullName: e.target.value }))
              }
              placeholder="Enter your full legal name"
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '0.85rem',
                border: formErrors.fullName ? '2px solid #ef4444' : '1px solid #cbd5f5',
                fontSize: '1rem'
              }}
            />
            {formErrors.fullName && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                {formErrors.fullName}
              </p>
            )}
          </div>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#1e293b', marginBottom: '0.45rem' }}>
                University *
              </label>
              <input
                type="text"
                value={formValues.university}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, university: e.target.value }))
                }
                placeholder="Target university or institute"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.85rem',
                  border: formErrors.university ? '2px solid #ef4444' : '1px solid #cbd5f5',
                  fontSize: '1rem'
                }}
              />
              {formErrors.university && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                  {formErrors.university}
                </p>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#1e293b', marginBottom: '0.45rem' }}>
                Program / course *
              </label>
              <input
                type="text"
                value={formValues.course}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, course: e.target.value }))
                }
                placeholder="e.g., MS in Computer Science"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.85rem',
                  border: formErrors.course ? '2px solid #ef4444' : '1px solid #cbd5f5',
                  fontSize: '1rem'
                }}
              />
              {formErrors.course && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                  {formErrors.course}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#1e293b', marginBottom: '0.45rem' }}>
                Destination country *
              </label>
              <input
                type="text"
                value={formValues.studyCountry}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, studyCountry: e.target.value }))
                }
                placeholder="Where will you be studying?"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.85rem',
                  border: formErrors.studyCountry ? '2px solid #ef4444' : '1px solid #cbd5f5',
                  fontSize: '1rem'
                }}
              />
              {formErrors.studyCountry && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                  {formErrors.studyCountry}
                </p>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#1e293b', marginBottom: '0.45rem' }}>
                Contact number *
              </label>
              <input
                type="tel"
                value={formValues.contactNumber}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, contactNumber: e.target.value }))
                }
                placeholder="10-digit mobile number"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.85rem',
                  border: formErrors.contactNumber ? '2px solid #ef4444' : '1px solid #cbd5f5',
                  fontSize: '1rem'
                }}
              />
              {formErrors.contactNumber && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                  {formErrors.contactNumber}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#1e293b', marginBottom: '0.45rem' }}>
                Co-applicant name (optional)
              </label>
              <input
                type="text"
                value={formValues.coApplicantName}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, coApplicantName: e.target.value }))
                }
                placeholder="Parent / guardian / spouse"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.85rem',
                  border: '1px solid #cbd5f5',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#1e293b', marginBottom: '0.45rem' }}>
                Relationship with co-applicant
              </label>
              <input
                type="text"
                value={formValues.coApplicantRelation}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, coApplicantRelation: e.target.value }))
                }
                placeholder="e.g., Father, Mother, Spouse"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.85rem',
                  border: '1px solid #cbd5f5',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Verify & upload documents',
      description: 'Submit mandatory documents with key details for quicker verification.',
      validator: () => {
        const errors = {};
        documentsConfig.forEach((doc) => {
          const metadata = documentMetadata[doc.id] || {};
          const file = documentFiles[doc.id];
          const docErrors = {};

          doc.fields?.forEach((field) => {
            const value = metadata[field.name]?.trim();
            if (field.required && !value) {
              docErrors[field.name] = `${field.label} is required`;
            } else if (field.pattern && value && !field.pattern.test(value)) {
              docErrors[field.name] = field.validationMessage;
            }
          });

          if (doc.mandatory && !file) {
            docErrors.file = 'File upload is required';
          } else if (
            file &&
            doc.maxSizeMb &&
            file.size > doc.maxSizeMb * 1024 * 1024
          ) {
            docErrors.file = `File must be under ${doc.maxSizeMb}MB`;
          }

          if (Object.keys(docErrors).length > 0) {
            errors[doc.id] = docErrors;
          }
        });

        setDocumentErrors(errors);
        return Object.keys(errors).length === 0;
      },
      content: (
        <LoanDocumentsSection
          documents={documentsConfig}
          metadata={documentMetadata}
          files={documentFiles}
          errors={documentErrors}
          onMetadataChange={(docId, key, value) => {
            setDocumentMetadata((prev) => ({
              ...prev,
              [docId]: { ...(prev[docId] || {}), [key]: value }
            }));
            setDocumentErrors((prev) => ({
              ...prev,
              [docId]: { ...(prev[docId] || {}), [key]: '' }
            }));
          }}
          onFileChange={(docId, file) => {
            setDocumentFiles((prev) => ({ ...prev, [docId]: file }));
            setDocumentErrors((prev) => ({
              ...prev,
              [docId]: { ...(prev[docId] || {}), file: '' }
            }));
          }}
        />
      )
    }
  ];

  const handleNext = async () => {
    const isValid = steps[activeStep].validator();
    if (!isValid) return;

    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
      return;
    }

    setSubmitting(true);
    try {
      const success = await onSubmit({
        loanIntent,
        profile: formValues,
        documents: {
          metadata: documentMetadata,
          files: documentFiles
        }
      });

      if (success !== false) {
        onClose();
      }
    } catch (error) {
      console.error('Loan submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15,23,42,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        padding: '2rem'
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '1.25rem',
          padding: '2rem',
          maxWidth: '760px',
          width: '100%',
          boxShadow: '0 30px 60px -24px rgba(15, 23, 42, 0.35)',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: '#64748b',
            fontSize: '1.5rem',
            lineHeight: 1
          }}
          aria-label="Close"
        >
          ×
        </button>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                Complete your application
              </h2>
              <p style={{ color: '#475569', fontSize: '0.95rem' }}>
                Step {activeStep + 1} of {steps.length} · {steps[activeStep].description}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.85rem', color: '#475569' }}>Loan amount</p>
              <p style={{ fontWeight: 600, color: '#4338ca' }}>
                {loanIntent ? loanIntent.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : '—'}
              </p>
            </div>
          </div>
          <div style={{ height: '6px', borderRadius: '999px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)', height: '100%' }} />
          </div>
        </div>

        <div style={{ marginBottom: '1.75rem' }}>
          {steps[activeStep].content}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => {
              if (submitting) return;
              if (activeStep === 0) {
                onClose();
              } else {
                setActiveStep((prev) => Math.max(0, prev - 1));
              }
            }}
            style={{
              padding: '0.9rem 1.5rem',
              borderRadius: '0.9rem',
              border: '1px solid #cbd5f5',
              backgroundColor: '#f8fafc',
              color: '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              minWidth: '160px'
            }}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={submitting}
            style={{
              padding: '0.9rem 1.8rem',
              borderRadius: '0.9rem',
              border: 'none',
              background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
              color: 'white',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              minWidth: '200px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 20px 35px -25px rgba(79, 70, 229, 0.7)'
            }}
          >
            {submitting ? 'Submitting...' : activeStep === steps.length - 1 ? 'Submit application' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentChecklist({ documents, onToggle }) {
  const completed = useMemo(
    () => documents.filter((doc) => doc.ready).length,
    [documents]
  );

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '1.5rem',
      padding: '1.75rem',
      boxShadow: '0 20px 40px -28px rgba(15, 23, 42, 0.25)',
      border: '1px solid rgba(226,232,240,0.6)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#0f172a' }}>Documents checklist</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Mark the documents you already have ready. We’ll guide you through the rest.</p>
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
          {completed}/{documents.length} ready
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {documents.map((doc) => (
          <label key={doc.id} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.9rem',
            padding: '1rem',
            borderRadius: '1rem',
            border: doc.ready ? '1px solid #bbf7d0' : '1px solid rgba(226,232,240,0.8)',
            backgroundColor: doc.ready ? '#f0fdf4' : '#f8fafc',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={doc.ready}
              onChange={() => onToggle(doc.id)}
              style={{ marginTop: '0.3rem', transform: 'scale(1.2)' }}
            />
            <div>
              <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.3rem' }}>{doc.title}</p>
              <p style={{ color: '#475569', fontSize: '0.9rem' }}>{doc.description}</p>
              {doc.mandatory && (
                <span style={{
                  marginTop: '0.5rem',
                  display: 'inline-block',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '999px',
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  Mandatory
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function StudentDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [showCibilCheck, setShowCibilCheck] = useState(false);
  const [showBasicDetailsForm, setShowBasicDetailsForm] = useState(false);
  const [cibilScore, setCibilScore] = useState(null);
  const [selectedLoanOffer, setSelectedLoanOffer] = useState(null);
  const [loanIntent, setLoanIntent] = useState(null);
  const [plannerAmount, setPlannerAmount] = useState(500000);
  const [plannerDuration, setPlannerDuration] = useState(24);
  const [plannerPurpose, setPlannerPurpose] = useState('Tuition & living expenses');
  const [plannerMessage, setPlannerMessage] = useState('');
  const [basicDetails, setBasicDetails] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const requiredDocuments = useMemo(() => [
    {
      id: 'aadhaar',
      title: 'Aadhaar / Passport',
      description: 'Upload a clear scan of your Aadhaar card or Passport.',
      mandatory: true,
      accept: '.pdf,.jpg,.jpeg,.png',
      maxSizeMb: 5,
      fields: [
        {
          name: 'documentType',
          label: 'Document type',
          placeholder: 'Aadhaar Card / Passport',
          required: true
        },
        {
          name: 'documentNumber',
          label: 'Document number',
          placeholder: 'XXXX-XXXX-XXXX',
          required: true,
          pattern: /^[0-9A-Za-z -]{6,20}$/,
          validationMessage: 'Enter a valid document number'
        },
        {
          name: 'nameOnDocument',
          label: 'Name as per document',
          placeholder: 'Enter name as printed',
          required: true
        }
      ]
    },
    {
      id: 'pan',
      title: 'PAN card',
      description: 'Upload PAN card copy for applicant or co-applicant.',
      mandatory: true,
      accept: '.pdf,.jpg,.jpeg,.png',
      maxSizeMb: 5,
      fields: [
        {
          name: 'panNumber',
          label: 'PAN number',
          placeholder: 'ABCDE1234F',
          required: true,
          pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
          validationMessage: 'Enter a valid PAN number'
        },
        {
          name: 'nameOnPan',
          label: 'Name as per PAN',
          placeholder: 'Enter name as on PAN',
          required: true
        }
      ]
    },
    {
      id: 'admissionLetter',
      title: 'Admission / Offer letter',
      description: 'Official admission or offer letter from your university.',
      mandatory: true,
      accept: '.pdf',
      maxSizeMb: 10,
      fields: [
        {
          name: 'institution',
          label: 'Institution name',
          placeholder: 'University / College name',
          required: true
        },
        {
          name: 'intake',
          label: 'Intake / semester',
          placeholder: 'e.g., Fall 2025',
          required: true
        }
      ]
    },
    {
      id: 'academicTranscripts',
      title: 'Academic transcripts',
      description: 'Latest academic transcripts or mark sheets.',
      mandatory: true,
      accept: '.pdf',
      maxSizeMb: 10,
      fields: [
        {
          name: 'qualification',
          label: 'Highest qualification',
          placeholder: 'e.g., B.Tech in Computer Science',
          required: true
        }
      ]
    },
    {
      id: 'financialStatements',
      title: 'Financial statements (optional)',
      description: 'Recent bank statements or income proofs to support your application.',
      mandatory: false,
      accept: '.pdf',
      maxSizeMb: 10,
      fields: [
        {
          name: 'statementType',
          label: 'Statement type',
          placeholder: 'Bank statement / Salary slip',
          required: false
        }
      ]
    }
  ], []);
  const [documents, setDocuments] = useState(() =>
    requiredDocuments.map((doc) => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      mandatory: doc.mandatory,
      ready: false
    }))
  );
  const [loanApplications, setLoanApplications] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loanPlannerMaxAmount = useMemo(() => {
    if (!cibilScore) return 2000000;
    if (cibilScore.score >= 750) return 2000000;
    if (cibilScore.score >= 650) return 1000000;
    return 500000;
  }, [cibilScore]);

  useEffect(() => {
    setPlannerAmount((prev) => Math.min(prev, loanPlannerMaxAmount));
  }, [loanPlannerMaxAmount]);

  useEffect(() => {
    setPlannerMessage('');
  }, [selectedLoanOffer, cibilScore]);

  useEffect(() => {
    if (!loanIntent) return;
    if (loanIntent.amount) setPlannerAmount(loanIntent.amount);
    if (loanIntent.duration) setPlannerDuration(loanIntent.duration);
    if (loanIntent.purpose) setPlannerPurpose(loanIntent.purpose);
  }, [loanIntent]);

  const formatCurrency = useCallback((value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value), []);

  const estimatedEmi = useMemo(() => {
    const principal = plannerAmount;
    const monthlyRate = 11.5 / 12 / 100;
    const tenure = plannerDuration;
    if (!principal || !monthlyRate || !tenure) return 0;
    const power = Math.pow(1 + monthlyRate, tenure);
    const emi = (principal * monthlyRate * power) / (power - 1 || 1);
    return Math.round(emi);
  }, [plannerAmount, plannerDuration]);

  const firstName = useMemo(() => {
    if (!user?.name) return 'Scholar';
    return user.name.split(' ')[0];
  }, [user?.name]);

  const initials = useMemo(() => {
    if (!user?.name) {
      if (!user?.email) return 'LF';
      return user.email.slice(0, 2).toUpperCase();
    }
    const parts = user.name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [user?.name, user?.email]);

  const openCibilModal = useCallback(() => setShowCibilCheck(true), []);

  const goToLoanPlanner = useCallback(() => {
    const section = document.getElementById('loan-plan');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const openLoanSelector = useCallback(() => {
    goToLoanPlanner();
  }, [goToLoanPlanner]);

  const handleCibilScoreFetched = useCallback((scoreData) => {
    setCibilScore(scoreData);
    setShowCibilCheck(false);
    if (scoreData.eligibility) {
      goToLoanPlanner();
    }
  }, [goToLoanPlanner]);

  const fetchApplications = useCallback(async () => {
    try {
      const response = await axios.get('/api/loans/my-applications');
      setLoanApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  }, []);

  const handleLoanPlannerSubmit = useCallback(() => {
    if (!selectedLoanOffer) {
      setPlannerMessage('Pick a funding program to unlock the planner.');
      goToLoanPlanner();
      return;
    }

    const intent = {
      amount: plannerAmount,
      purpose: plannerPurpose,
      duration: plannerDuration,
      cibilScore: cibilScore?.score || null,
      pan: cibilScore?.pan || null,
      programId: selectedLoanOffer
    };

    setLoanIntent(intent);
    setPlannerMessage('');
    setShowBasicDetailsForm(true);
  }, [selectedLoanOffer, cibilScore, plannerAmount, plannerPurpose, plannerDuration, goToLoanPlanner]);

  const handleBasicDetailsSubmit = useCallback(async ({ loanIntent: intent, profile, documents }) => {
    try {
      const formData = new FormData();
      formData.append('amount', intent.amount);
      formData.append('purpose', intent.purpose);
      formData.append('duration', intent.duration);
      if (intent.cibilScore) formData.append('cibilScore', intent.cibilScore);
      if (intent.pan) formData.append('pan', intent.pan);
      if (intent.programId) formData.append('programId', intent.programId);

      formData.append('profile[fullName]', profile.fullName);
      formData.append('profile[university]', profile.university);
      formData.append('profile[course]', profile.course);
      formData.append('profile[studyCountry]', profile.studyCountry);
      formData.append('profile[contactNumber]', profile.contactNumber);
      if (profile.coApplicantName) formData.append('profile[coApplicantName]', profile.coApplicantName);
      if (profile.coApplicantRelation) formData.append('profile[coApplicantRelation]', profile.coApplicantRelation);

      Object.entries(documents.metadata || {}).forEach(([docId, meta]) => {
        Object.entries(meta || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(`documents[${docId}][metadata][${key}]`, value);
          }
        });
      });

      Object.entries(documents.files || {}).forEach(([docId, file]) => {
        if (file) {
          formData.append(`documents[${docId}][file]`, file);
        }
      });

      const response = await axios.post('/api/loans/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setBasicDetails(profile);
        setLoanIntent(intent);
        setShowBasicDetailsForm(false);
        fetchApplications();
        return true;
      }
    } catch (error) {
      console.error('Loan application error:', error);
      return false;
    }
    return false;
  }, [fetchApplications]);

  const handleDocumentToggle = useCallback((id) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, ready: !doc.ready } : doc
      )
    );
  }, []);

  const openBasicDetails = useCallback(() => {
    if (!loanIntent) {
      setPlannerMessage('Lock your loan amount first to continue.');
      goToLoanPlanner();
      return;
    }
    setShowBasicDetailsForm(true);
  }, [loanIntent, goToLoanPlanner]);

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

  const loanPrograms = useMemo(() => ([
    {
      id: 'starter',
      title: 'LaunchPad Loans',
      description: 'Perfect for students starting their journey with flexible EMIs and quick approval.',
      coverage: 'Up to ₹25L · 15 year tenure',
      highlights: ['No pre-payment penalty', 'Dual parent + student co-applicant', 'Grace period up to 12 months'],
      accent: '#22c55e'
    },
    {
      id: 'global',
      title: 'Global Dream Fund',
      description: 'Designed for international admits with zero margin requirements and USD payouts.',
      coverage: 'Up to ₹40L · 20 year tenure',
      highlights: ['Covers tuition + living', 'Multi-currency disbursal', 'Visa assistance desk'],
      accent: '#16a34a'
    },
    {
      id: 'accelerate',
      title: 'Accelerate Pro',
      description: 'For top admits with premium rates, faster disbursal and credit boosters.',
      coverage: 'Up to ₹60L · 20 year tenure',
      highlights: ['Rate drop rewards', 'AI-powered offer comparison', 'Dedicated relationship coach'],
      accent: '#22c55e'
    }
  ]), []);

  const progressHighlights = useMemo(() => {
    return [
      cibilScore
        ? { label: 'Credit check', value: `${cibilScore.score} pts`, accent: cibilScore.score >= 750 ? '#22c55e' : '#f97316' }
        : { label: 'Credit check', value: 'Pending', accent: '#f97316' },
      loanIntent
        ? { label: 'Requested amount', value: `₹${loanIntent.amount?.toLocaleString('en-IN')}`, accent: '#38bdf8' }
        : { label: 'Requested amount', value: 'Awaiting selection', accent: '#38bdf8' },
      basicDetails
        ? { label: 'Profile details', value: 'Submitted', accent: '#a855f7' }
        : { label: 'Profile details', value: 'Pending', accent: '#a855f7' }
    ];
  }, [cibilScore, loanIntent, basicDetails]);

  const journeySteps = useMemo(() => [
    {
      title: 'Explore funding programs',
      description: 'Review our specialised loan programs and pick the one that fits your journey.',
      completed: !!selectedLoanOffer,
      actionLabel: 'View programs',
      onAction: () => {
        document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: 'Choose your loan amount',
      description: 'Check your credit snapshot, then design the amount and tenure that fits your plan.',
      completed: !!loanIntent,
      actionLabel: cibilScore ? 'Design amount' : 'Check CIBIL',
      onAction: cibilScore ? openLoanSelector : openCibilModal
    },
    {
      title: 'Share basic details',
      description: 'Tell us about your admit, course and contact so we can match lending partners.',
      completed: !!basicDetails,
      actionLabel: basicDetails ? 'Update details' : 'Add details',
      onAction: openBasicDetails
    },
    {
      title: 'Prepare documents',
      description: 'Keep your identity, admission and financial proofs ready for quick approval.',
      completed: documents.every((doc) => doc.ready),
      actionLabel: 'View checklist',
      onAction: () => {
        document.getElementById('documents')?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  ], [selectedLoanOffer, loanIntent, basicDetails, documents, cibilScore, openLoanSelector, openCibilModal, openBasicDetails]);

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

  const plannerMinAmount = 100000;
  const plannerStep = 50000;

  // Fetch user status on mount
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        const userData = response.data.user;
        
        // Determine user status - check if profileVerified and documentsSubmitted exist
        // For now, we'll use emailVerified as the main check
        if (userData.emailVerified && !userData.profileVerified) {
          setUserStatus('profile_pending');
        } else if (userData.emailVerified && userData.profileVerified && !userData.documentsSubmitted) {
          setUserStatus('documents_required');
        } else {
          setUserStatus('ready');
        }
      } catch (error) {
        console.error('Error fetching user status:', error);
        // Default to ready if error
        setUserStatus('ready');
      } finally {
        setLoadingStatus(false);
      }
    };

    if (user) {
      fetchUserStatus();
    } else {
      setLoadingStatus(false);
      setUserStatus('ready');
    }
  }, [user]);

  // Show loading state
  if (loadingStatus) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#22c55e',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b' }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Always show documents upload portal for students (streamlined phase)
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      <StudentDocumentsUpload />
    </div>
  );

  // Legacy dashboard UI (disabled for streamlined flow)
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
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 40%, #15803d 100%)',
          borderRadius: '1.75rem',
          padding: '2.75rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 30px 60px -40px rgba(8, 145, 178, 0.4)',
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

        <section id="loan-plan" style={{ marginBottom: '2.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', alignItems: 'stretch' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1.5rem',
            padding: '1.9rem',
            boxShadow: '0 24px 44px -28px rgba(15, 23, 42, 0.22)',
            border: '1px solid rgba(226,232,240,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#0f172a' }}>Design your loan blueprint</h2>
                <p style={{ color: '#475569', fontSize: '0.95rem' }}>
                  Choose the amount you need, review the projected EMI, then continue with your study details.
                </p>
              </div>
              <div style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '999px',
                backgroundColor: '#eef2ff',
                color: '#4338ca',
                fontWeight: 600,
                fontSize: '0.8rem',
                whiteSpace: 'nowrap'
              }}>
                Max {formatCurrency(loanPlannerMaxAmount)}
              </div>
            </div>

            <div style={{
              padding: '1.25rem',
              borderRadius: '1.2rem',
              backgroundColor: '#f8fafc',
              border: '1px solid rgba(226,232,240,0.8)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '1rem' }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>Loan amount</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#4338ca' }}>{formatCurrency(plannerAmount)}</span>
              </div>
              <input
                type="range"
                min={plannerMinAmount}
                max={loanPlannerMaxAmount}
                step={plannerStep}
                value={plannerAmount}
                onChange={(e) => setPlannerAmount(parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: 'linear-gradient(to right, #22c55e 0%, #15803d 100%)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                <span>{formatCurrency(plannerMinAmount)}</span>
                <span>{formatCurrency(loanPlannerMaxAmount)}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <div>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: 600, marginBottom: '0.5rem' }}>Loan purpose</label>
                <select
                  value={plannerPurpose}
                  onChange={(e) => setPlannerPurpose(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '0.85rem',
                    border: '1px solid #d1d5db',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="Tuition & living expenses">Tuition & living expenses</option>
                  <option value="Tuition fee only">Tuition fee only</option>
                  <option value="Living expenses support">Living expenses support</option>
                  <option value="Books & learning materials">Books & learning materials</option>
                  <option value="Technology & equipment">Technology & equipment</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: 600, marginBottom: '0.5rem' }}>Repayment tenure</label>
                <select
                  value={plannerDuration}
                  onChange={(e) => setPlannerDuration(parseInt(e.target.value, 10))}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '0.85rem',
                    border: '1px solid #d1d5db',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value={12}>12 months</option>
                  <option value={24}>24 months</option>
                  <option value={36}>36 months</option>
                  <option value={48}>48 months</option>
                  <option value={60}>60 months</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '1.75rem' }}>
              <div style={{
                padding: '1rem',
                borderRadius: '1rem',
                backgroundColor: '#eef2ff',
                color: '#312e81'
              }}>
                <p style={{ fontSize: '0.8rem', marginBottom: '0.35rem', opacity: 0.8 }}>Estimated EMI*</p>
                <p style={{ fontSize: '1.3rem', fontWeight: 700 }}>{formatCurrency(estimatedEmi)}</p>
                <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Assuming 11.5% annual rate</p>
              </div>
              <div style={{
                padding: '1rem',
                borderRadius: '1rem',
                backgroundColor: '#ecfdf5',
                color: '#065f46'
              }}>
                <p style={{ fontSize: '0.8rem', marginBottom: '0.35rem', opacity: 0.8 }}>Next step</p>
                <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                  Share your admit details & documents to match lending partners.
                </p>
              </div>
            </div>

            <button
              onClick={handleLoanPlannerSubmit}
              style={{
                width: '100%',
                padding: '0.95rem',
                borderRadius: '0.95rem',
                border: 'none',
                background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 20px 35px -25px rgba(79, 70, 229, 0.7)'
              }}
            >
              <ShieldCheck size={18} />
              Save amount & continue
            </button>

            {plannerMessage && (
              <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.85rem' }}>
                {plannerMessage}
              </p>
            )}
            {loanIntent && !plannerMessage && (
              <p style={{ color: '#22c55e', fontSize: '0.85rem', marginTop: '0.85rem' }}>
                Amount saved. Let’s complete your study profile next.
              </p>
            )}

            {!cibilScore && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                borderRadius: '1rem',
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa',
                color: '#92400e',
                fontSize: '0.9rem'
              }}>
                Start with a quick CIBIL check to unlock personalised limits and offers.
              </div>
            )}
          </div>

          <DocumentChecklist documents={documents} onToggle={handleDocumentToggle} />
        </section>

        <section id="programs" style={{ marginBottom: '2.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem' }}>
          {loanPrograms.map((program) => {
            const isSelected = selectedLoanOffer === program.id;
            return (
              <div key={program.id} style={{
                backgroundColor: 'white',
                borderRadius: '1.5rem',
                padding: '1.9rem',
                border: isSelected ? `2px solid ${program.accent}` : '1px solid rgba(226,232,240,0.6)',
                boxShadow: '0 24px 44px -28px rgba(15, 23, 42, 0.22)',
                transition: 'transform 0.2s',
                transform: isSelected ? 'translateY(-4px)' : 'translateY(0)'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '1rem',
                  backgroundColor: program.accent + '1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}>
                  <CreditCard size={30} color={program.accent} />
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>{program.title}</h2>
                <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1rem' }}>{program.description}</p>
                <p style={{ color: program.accent, fontWeight: 600, marginBottom: '1rem' }}>{program.coverage}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', color: '#475569', fontSize: '0.9rem' }}>
                  {program.highlights.map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <CheckCircle size={16} color={program.accent} />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    setSelectedLoanOffer(program.id);
                    openLoanSelector();
                  }}
                  style={{
                    marginTop: '1.5rem',
                    width: '100%',
                    padding: '0.9rem',
                    borderRadius: '0.9rem',
                    border: 'none',
                    background: isSelected ? program.accent : 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {isSelected ? 'Selected · Continue' : 'Compare loan amount'}
                </button>
              </div>
            );
          })}
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
                    {step.completed ? <CheckCircle size={18} color="#22c55e" /> : <span style={{ fontWeight: 600, color: '#22c55e' }}>{index + 1}</span>}
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
                          backgroundColor: step.completed ? '#22c55e' : '#22c55e',
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

        <section id="profile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1.5rem',
            padding: '1.75rem',
            boxShadow: '0 20px 40px -28px rgba(15, 23, 42, 0.25)',
            border: '1px solid rgba(226,232,240,0.6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.35rem' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '1.2rem',
                background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.6rem',
                fontWeight: 700
              }}>
                {initials}
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#0f172a' }}>{user?.name || 'LoanFlow Scholar'}</h2>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>{user?.email}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                borderRadius: '1rem',
                backgroundColor: '#f8fafc'
              }}>
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Membership tier</p>
                  <p style={{ fontWeight: 600, color: '#0f172a' }}>Student Explorer</p>
                </div>
                <span style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  Active
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                borderRadius: '1rem',
                backgroundColor: '#f1f5f9'
              }}>
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Learning focus</p>
                  <p style={{ fontWeight: 600, color: '#0f172a' }}>Education finance prep</p>
                </div>
                <Sparkles size={18} color="#f59e0b" />
              </div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                marginTop: '1.5rem',
                width: '100%',
                padding: '0.85rem',
                borderRadius: '0.9rem',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                color: '#ef4444',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Manage / delete account
            </button>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '1.5rem',
            padding: '1.75rem',
            boxShadow: '0 20px 40px -28px rgba(15, 23, 42, 0.25)',
            border: '1px solid rgba(226,232,240,0.6)'
          }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>Need a personalised strategy?</h2>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              Book a 20-minute consultation with our finance mentors to map scholarships, loan timelines, and repayment plans tailored for your destination.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <a
                href={"https://wa.me/917569389584?text=" + encodeURIComponent("Hi Kubera mentor! I’m ready to plan my education loan journey. Can you guide me through the next steps?")}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '0.9rem',
                  border: 'none',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                <Send size={18} />
                WhatsApp mentor desk
              </a>
              <a
                href="tel:+917569389584"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '0.9rem',
                  border: '1px solid #22c55e',
                  backgroundColor: 'white',
                  color: '#22c55e',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                <Phone size={18} />
                Call mentor desk
              </a>
            </div>
          </div>
        </section>

        <section id="resources" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {!cibilScore ? (
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
                <CreditCard size={34} color="#22c55e" />
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
                  backgroundColor: '#22c55e',
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
                  <div style={{ fontSize: '2.25rem', fontWeight: 700, color: cibilScore.score >= 750 ? '#22c55e' : cibilScore.score >= 650 ? '#22c55e' : '#f59e0b' }}>{cibilScore.score}</div>
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
                  onClick={openLoanSelector}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.85rem 1.4rem',
                    borderRadius: '0.9rem',
                    border: 'none',
                    backgroundColor: '#22c55e',
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
                color: '#22c55e',
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
                <Compass size={32} color="#22c55e" style={{ marginBottom: '1rem' }} />
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
                  backgroundColor: '#22c55e',
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

      <LoanApplicationModal
        isOpen={showBasicDetailsForm}
        onClose={() => setShowBasicDetailsForm(false)}
        loanIntent={loanIntent}
        onSubmit={handleBasicDetailsSubmit}
        documentsConfig={requiredDocuments}
      />

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
