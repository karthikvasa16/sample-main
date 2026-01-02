import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { GraduationCap, Wallet, Clock, Plus, Upload, FileText, CheckCircle, ChevronRight, Calculator, Phone, X, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import DeleteAccountModal from '../components/DeleteAccountModal';
import StudentDocumentsUpload from '../components/StudentDocumentsUpload';
import apiClient from '../config/axios';

// Dashboard for student applicants
function StudentDashboard() {

  const { user } = useAuth(); // Need login to update user context if name changes
  const { toast } = useToast();
  const location = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', password: '', confirmPassword: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState({});
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    document.title = 'Applicant Dashboard | Kubera';
  }, []);

  const documentsRef = useRef(null);
  const emiCalculatorRef = useRef(null);

  // EMI Calculator State
  const [emiAmount, setEmiAmount] = useState(1000000);
  const [emiRate, setEmiRate] = useState(10.5);
  const [emiTenure, setEmiTenure] = useState(120); // Months
  const [calculatedEMI, setCalculatedEMI] = useState(0);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else if (id === 'overview') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [location]);

  useEffect(() => {
    // EMI Calculation: P * r * (1 + r)^n / ((1 + r)^n - 1)

    // r = annual rate / 12 / 100
    const r = emiRate / 12 / 100;
    const n = emiTenure;
    const emi = (emiAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setCalculatedEMI(Math.round(emi));
  }, [emiAmount, emiRate, emiTenure]);

  // Stable Applicant ID derived from user data
  const applicantId = useMemo(() => {
    if (!user) return 'KUB-000000';
    // Create a simple deterministic ID from user ID
    if (user.id) {
      // If numeric ID
      if (typeof user.id === 'number') return `KUB-${100000 + user.id}`;
      // If string/UUID, take last 6 chars or hash (simple fallback)
      const idStr = user.id.toString();
      const num = idStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return `KUB-${100000 + (num % 900000)}`;
    }
    return 'KUB-Guest';
  }, [user]);

  // Fetch user data, applications, and documents
  useEffect(() => {
    const fetchData = async () => {
      try {
        await apiClient.get('/api/auth/me');

        const [appsRes, docsRes] = await Promise.all([
          apiClient.get('/api/loans/my-applications'),
          apiClient.get('/api/documents/my-documents')
        ]);

        setApplications(appsRes.data.applications || []);
        setDocuments(docsRes.data.documents || {});
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoadingStatus(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setLoadingStatus(false);
    }
  }, [user]);

  // Calculate Progress
  const progressStats = useMemo(() => {
    const totalMandatoryDocs = 15; // Approximate count, can be dynamic based on rules
    const uploadedCount = Object.keys(documents).length;
    const docProgress = Math.min(Math.round((uploadedCount / totalMandatoryDocs) * 100), 100);

    // Application verification status (simple logic for now)
    const activeApp = applications[0];
    let verifyProgress = 0;
    if (activeApp) {
      if (activeApp.status === 'Approved') verifyProgress = 100;
      else if (activeApp.status === 'In Review') verifyProgress = 60;
      else if (activeApp.status === 'Pending') verifyProgress = 20;
    }

    return { docProgress, verifyProgress };
  }, [documents, applications]);

  // Callback to update local state when child uploads a document
  const handleDocumentUpdate = (docId, docData) => {
    setDocuments(prev => ({
      ...prev,
      [docId]: docData
    }));
  };

  const handleScrollTo = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNewApplication = () => {
    // Check limits
    if (applications.length >= 2) {
      toast.error('You can only have a maximum of 2 active applications.');
      return;
    }

    // Check if first application has documents uploaded (if applicable)
    if (applications.length === 1) {
      const hasDocs = Object.keys(documents).length > 0;
      if (!hasDocs) {
        toast.warning('Please upload documents for your first application before starting a new one.');
        handleScrollTo(documentsRef);
        return;
      }
    }

    // Determine target location/modal for new app
    toast.info('Starting new application flow...');
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length > 5) strength += 1;
    if (password.length > 7) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return Math.min(strength, 4); // 0-4 scale
  };

  const passwordStrength = useMemo(() => {
    return checkPasswordStrength(profileForm.password);
  }, [profileForm.password]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (profileForm.password) {
      if (profileForm.password !== profileForm.confirmPassword) {
        toast.error("Passwords don't match!");
        return;
      }
      if (passwordStrength < 2) {
        toast.error("Password is too weak. Please use a stronger password.");
        return;
      }
    }

    setProfileLoading(true);
    try {
      const { data } = await apiClient.put('/api/auth/profile', {
        name: profileForm.name,
        password: profileForm.password || undefined
      });

      if (data.success) {
        toast.success('Profile updated successfully!');
        setShowProfileModal(false);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const openProfileModal = () => {
    setProfileForm({ name: user.name, password: '', confirmPassword: '' });
    setShowProfileModal(true);
  };

  const openWhatsApp = () => {
    // Open WhatsApp with pre-filled text
    const phoneNumber = "919876543210"; // Replace with actual support number
    const text = encodeURIComponent("Hi, I need help with my student loan application.");
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank');
  };

  if (loadingStatus) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ecfdf5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #d1fae5',
            borderTopColor: '#15803d',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#065f46' }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ecfdf5', // Light Mint Background
      position: 'relative'
    }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.85)', // Translucent White
        backdropFilter: 'blur(12px)', // Glass Effect
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem 2rem 1rem 5rem', // Added left padding to clear Sidebar button
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <GraduationCap size={24} color="#15803d" />
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#064e3b', letterSpacing: '-0.02em' }}>Kubera</span>
            </div>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }}></div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                Applicant Dashboard
              </h1>
              <p style={{ color: '#64748b', margin: '0', fontSize: '0.8rem' }}>
                ID: <span style={{ fontFamily: "'Outfit', monospace", fontWeight: 600 }}>{applicantId}</span>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              onClick={openProfileModal}
              style={{
                textAlign: 'right',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Click to edit profile"
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#166534' }}>{user?.name || 'Guest'}</div>
              <div style={{ fontSize: '0.75rem', color: '#15803d' }}>Student Applicant</div>
            </div>
            <div
              onClick={openProfileModal}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#15803d',
                fontWeight: 700,
                border: '1px solid #dcfce7',
                cursor: 'pointer'
              }}
              title="Click to edit profile"
            >
              {user?.name ? user.name[0] : 'U'}
            </div>

            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                padding: '0.5rem',
                color: '#ef4444',
                backgroundColor: 'transparent',
                border: '1px solid #fee2e2',
                borderRadius: '6px',
                cursor: 'pointer',
                marginLeft: '0.5rem',
                transition: 'all 0.2s'
              }}
              title="Manage Account"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <div id="overview" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '6rem 2rem 4rem',
        position: 'relative',
        zIndex: 1,
        fontFamily: "'Outfit', sans-serif"
      }}>

        {/* 1. Welcome Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 50%, #a7f3d0 100%)', // Light Mint Gradient from Home.js
          borderRadius: '1.5rem',
          padding: '3rem',
          color: '#000000', // Updated to Black
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 15px -3px rgba(6, 78, 59, 0.1)'
        }}>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '-0.02em', color: '#000000' }}>
              Welcome back, {user?.name || 'Scholar'}! 👋
            </h1>
            <p style={{ fontSize: '1.125rem', opacity: 0.9, maxWidth: '600px', lineHeight: '1.5', color: '#333333' }}>
              Track your education loan applications and manage your documents all in one place.
            </p>
          </div>
          {/* Decorative Circle - Updated for light background */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            pointerEvents: 'none'
          }} />
        </div>

        {/* 2. Key Statistics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {[
            {
              label: 'Total Loan Amount',
              value: applications.length > 0 ? `₹${applications.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0).toLocaleString('en-IN')}` : '₹0',
              sub: 'Across all applications',
              icon: Wallet,
              color: '#064e3b',
              bg: '#ecfdf5'
            },
            {
              label: 'Active Applications',
              value: applications.filter(a => a.status !== 'Rejected').length.toString(),
              sub: 'In progress',
              icon: CheckCircle,
              color: '#064e3b',
              bg: '#ecfdf5'
            },
            {
              label: 'Pending Reviews',
              value: applications.filter(a => a.status === 'Pending' || a.status === 'In Review').length.toString(),
              sub: 'Under processing',
              icon: Clock,
              color: '#d97706',
              bg: '#fffbeb'
            },
            {
              label: 'Documents Uploaded',
              value: Object.keys(documents).length.toString(),
              sub: 'Total files saved',
              icon: FileText,
              color: '#64748b',
              bg: '#f1f5f9'
            }
          ].map((stat, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>{stat.label}</p>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{stat.sub}</div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '0.75rem',
                backgroundColor: stat.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: stat.color
              }}>
                <stat.icon size={24} />
              </div>
            </div>
          ))}
        </div>

        {/* 3. Recent Applications & Quick Actions Layout */}
        <div id="applications" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '3rem' }}>

          {/* Left Column: Applications */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>Recent Applications</h2>
              <button style={{ color: '#064e3b', fontWeight: 600, fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {applications.length > 0 ? (
                applications.map((app, index) => (
                  <div key={index} style={{
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s',
                    cursor: 'pointer'
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    onClick={() => setSelectedApp(app)} // Make entire card clickable
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '0.75rem',
                          backgroundColor: '#ecfdf5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#064e3b'
                        }}>
                          <FileText size={24} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>{app.universityName}</h3>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <p style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span>📍</span> {app.applicantCountry || 'Unknown Country'}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span>🎓</span> {app.course}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span>🗓️</span> {app.applicantIntake || app.intake || 'N/A'}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span>📋</span> {app.admissionStatus || 'Applied'}
                            </p>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>ID: {app.applicationId}</p>
                        </div>
                      </div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: app.status === 'Approved' ? '#d1fae5' : app.status === 'Rejected' ? '#fee2e2' : '#fff7ed',
                        color: app.status === 'Approved' ? '#059669' : app.status === 'Rejected' ? '#dc2626' : '#ea580c'
                      }}>
                        {app.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>₹{parseFloat(app.amount).toLocaleString('en-IN')}</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent double trigger
                              setSelectedApp(app);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              color: '#064e3b',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            View Details <ChevronRight size={16} style={{ marginLeft: '0.25rem' }} />
                          </button>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                          {app.admissionStatus && <span style={{ color: '#059669', fontWeight: 500 }}>{app.admissionStatus}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', color: '#64748b' }}>
                  No active applications found. Start a new one!
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quick Actions */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '1.5rem' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1rem' }}>
              {[
                { label: 'New Application', sub: 'Start a loan application', icon: Plus },
                { label: 'Upload Documents', sub: 'Submit required docs', icon: Upload },
                { label: 'EMI Calculator', sub: 'Calculate payments', icon: Calculator },
                { label: 'Contact Support', sub: 'Get help 24/7', icon: Phone }
              ].map((action, index) => {
                const isNewApp = action.label === 'New Application';
                // Logic: Disable if max apps reached OR if 1st app exists but no docs uploaded
                const hasDocs = Object.keys(documents).length > 0;
                const isLimitReached = applications.length >= 2;
                const isDocsMissing = applications.length === 1 && !hasDocs;

                const isDisabled = isNewApp && (isLimitReached || isDocsMissing);

                const disabledReason = isLimitReached ? '(Limit Reached)' : isDocsMissing ? '(Complete Current App)' : '';

                return (
                  <button key={index}
                    disabled={isDisabled}
                    onClick={() => {
                      if (action.label === 'New Application') handleNewApplication();
                      else if (action.label === 'Upload Documents') handleScrollTo(documentsRef);
                      else if (action.label === 'EMI Calculator') handleScrollTo(emiCalculatorRef);
                      else if (action.label === 'Contact Support') openWhatsApp();
                    }}
                    style={{
                      backgroundColor: isDisabled ? '#f8fafc' : 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '1rem',
                      padding: '1.25rem',
                      textAlign: 'left',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      opacity: isDisabled ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isDisabled) {
                        e.currentTarget.style.borderColor = '#064e3b';
                        e.currentTarget.style.backgroundColor = '#f0fdf4';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isDisabled) {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <div style={{
                      minWidth: '40px',
                      height: '40px',
                      borderRadius: '0.5rem',
                      backgroundColor: isDisabled ? '#e2e8f0' : '#ecfdf5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isDisabled ? '#94a3b8' : '#064e3b'
                    }}>
                      <action.icon size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: isDisabled ? '#94a3b8' : '#111827' }}>
                        {action.label}
                        {isDisabled && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginLeft: '0.5rem', fontWeight: 500 }}> {disabledReason}</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{action.sub}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* 4. Application Progress Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginBottom: '3rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '1.5rem' }}>Application Progress</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Progress Item 1 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#374151' }}>Documents Uploaded</span>
                <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#064e3b' }}>{progressStats.docProgress}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progressStats.docProgress}%`, height: '100%', backgroundColor: '#059669', borderRadius: '4px' }}></div>
              </div>
            </div>
            {/* Progress Item 2 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#374151' }}>Verification Status</span>
                <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#064e3b' }}>{progressStats.verifyProgress}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progressStats.verifyProgress}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <section style={{ marginTop: '2rem' }}>
          <h2 ref={documentsRef} style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '1.5rem', scrollMarginTop: '100px' }}>Your Documents</h2>
          <div id="documents">
            <StudentDocumentsUpload initialDocuments={documents} onUploadSuccess={handleDocumentUpdate} />
          </div>
        </section>

        {/* EMI Calculator Section */}
        <section id="calculator" style={{ marginTop: '4rem', paddingBottom: '2rem' }}>
          <h2 ref={emiCalculatorRef} style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '1.5rem', scrollMarginTop: '100px' }}>EMI Calculator</h2>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)',
            gap: '3rem',
            alignItems: 'center'
          }}>
            <div>
              {/* Amount Slider */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <label style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>Loan Amount</label>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#15803d', backgroundColor: '#ecfdf5', padding: '0.25rem 0.75rem', borderRadius: '0.5rem' }}>₹{emiAmount.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="10000000"
                  step="10000"
                  value={emiAmount}
                  onChange={(e) => setEmiAmount(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#15803d', height: '6px', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <span>₹1L</span>
                  <span>₹1Cr</span>
                </div>
              </div>

              {/* Interest Rate Slider */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <label style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>Interest Rate (p.a)</label>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#15803d', backgroundColor: '#ecfdf5', padding: '0.25rem 0.75rem', borderRadius: '0.5rem' }}>{emiRate}%</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="18"
                  step="0.1"
                  value={emiRate}
                  onChange={(e) => setEmiRate(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#15803d', height: '6px', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <span>8%</span>
                  <span>18%</span>
                </div>
              </div>

              {/* Tenure Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <label style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>Tenure (Months)</label>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#15803d', backgroundColor: '#ecfdf5', padding: '0.25rem 0.75rem', borderRadius: '0.5rem' }}>{emiTenure} Months</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="180"
                  step="6"
                  value={emiTenure}
                  onChange={(e) => setEmiTenure(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#15803d', height: '6px', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <span>12M</span>
                  <span>180M</span>
                </div>
              </div>
            </div>

            {/* Result Circle */}
            <div style={{
              backgroundColor: '#f0fdf4',
              borderRadius: '50%',
              width: '300px',
              height: '300px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              border: '8px solid #dcfce7',
              boxShadow: '0 0 0 4px white inset'
            }}>
              <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500, marginBottom: '0.5rem' }}>Your Monthly EMI</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#15803d' }}>₹{calculatedEMI.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '0.875rem', color: '#166534', marginTop: '0.5rem', fontWeight: 500 }}>
                Total Interest: ₹{((calculatedEMI * emiTenure) - emiAmount).toLocaleString('en-IN')}
              </div>
              <button
                onClick={handleNewApplication}
                style={{
                  marginTop: '1.5rem',
                  padding: '0.75rem 2rem',
                  backgroundColor: '#15803d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '2rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(21, 128, 61, 0.4)'
                }}
              >
                Apply for this
              </button>
            </div>
          </div>
        </section>

        {/* Application Details Modal */}
        {selectedApp && createPortal(
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
            zIndex: 9999, // Ensure it's on top of everything
            padding: '1rem',
            backdropFilter: 'blur(4px)'
          }}
            onClick={() => setSelectedApp(null)}
          >
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1.5rem',
              padding: '2rem',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedApp(null)}
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fee2e2';
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              >
                <X size={18} />
              </button>

              <div style={{ marginBottom: '2rem' }}>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: selectedApp.status === 'Approved' ? '#059669' : selectedApp.status === 'Rejected' ? '#dc2626' : '#ea580c',
                  backgroundColor: selectedApp.status === 'Approved' ? '#d1fae5' : selectedApp.status === 'Rejected' ? '#fee2e2' : '#fff7ed',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  marginBottom: '1rem',
                  display: 'inline-block'
                }}>
                  {selectedApp.status}
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
                  {selectedApp.universityName}
                </h2>
                <p style={{ color: '#64748b', fontSize: '1rem' }}>
                  {selectedApp.course} • {selectedApp.applicantCountry}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Application ID</p>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', fontFamily: 'monospace' }}>{selectedApp.applicationId}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Loan Amount</p>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>₹{parseFloat(selectedApp.amount).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Applied Date</p>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>{new Date(selectedApp.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Intake</p>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>{selectedApp.applicantIntake || selectedApp.intake || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Admission Status</p>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>{selectedApp.admissionStatus || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Duration</p>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>{selectedApp.duration} months</p>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>Next Steps</h3>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}>1</div>
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>Document Verification</p>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Our team is reviewing your uploaded documents. This usually takes 24-48 hours.</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedApp(null)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
          , document.body)}

        {/* Profile Edit Modal */}
        {showProfileModal && createPortal(
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
            zIndex: 9999,
            padding: '1rem',
            backdropFilter: 'blur(4px)'
          }}
            onClick={() => setShowProfileModal(false)}
          >
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              position: 'relative'
            }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
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
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
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
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#111827' }}>
                Edit Profile
              </h2>

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
                      fontSize: '1rem'
                    }}
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
                      fontSize: '1rem'
                    }}
                    minLength={6}
                  />
                  {/* Password Strength Meter */}
                  {profileForm.password && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '0.25rem' }}>
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              borderRadius: '2px',
                              backgroundColor: i < passwordStrength
                                ? ['#ef4444', '#f59e0b', '#eab308', '#22c55e'][passwordStrength - 1]
                                : '#e5e7eb',
                              transition: 'background-color 0.3s ease'
                            }}
                          />
                        ))}
                      </div>
                      <p style={{
                        fontSize: '0.75rem',
                        color: ['#ef4444', '#f59e0b', '#eab308', '#16a34a'][Math.max(0, passwordStrength - 1)] || '#6b7280',
                        textAlign: 'right',
                        fontWeight: 600
                      }}>
                        {['Weak', 'Fair', 'Good', 'Strong'][Math.max(0, passwordStrength - 1)] || 'Too Short'}
                      </p>
                    </div>
                  )}
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
                        fontSize: '1rem'
                      }}
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={profileLoading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: profileLoading ? 'not-allowed' : 'pointer',
                    opacity: profileLoading ? 0.7 : 1
                  }}
                >
                  {profileLoading ? 'Updating...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
          , document.body)}

      </div>

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
