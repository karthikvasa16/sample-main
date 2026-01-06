import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../config/axios';
import axios from 'axios';
import {
  Search,
  Mail,
  Phone,
  Send,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  X
} from 'lucide-react';

const statusLabels = {
  new: { label: 'New', color: '#1d4ed8', background: '#dbeafe' },
  contacted: { label: 'Contacted', color: '#0f766e', background: '#ccfbf1' },
  in_progress: { label: 'In Progress', color: '#92400e', background: '#fef3c7' },
  verification_sent: { label: 'Verification Sent', color: '#4f46e5', background: '#ede9fe' },
  converted: { label: 'Converted', color: '#166534', background: '#dcfce7' },
  closed: { label: 'Closed', color: '#991b1b', background: '#fee2e2' }
};

const statusOptions = Object.keys(statusLabels).map((key) => ({
  value: key,
  label: statusLabels[key].label
}));

const spinnerStyle = { animation: 'loaderSpin 1s linear infinite' };

const admissionStatusMap = {
  not_applied: 'Planning to apply',
  applied: 'Applied with university',
  confirmed: 'Offer confirmed'
};

function StatusBadge({ status }) {
  const config = statusLabels[status] || statusLabels.new;
  return (
    <span
      style={{
        padding: '0.35rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: config.color,
        backgroundColor: config.background
      }}
    >
      {config.label}
    </span>
  );
}


function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', studyCountry: '' });
  const [sendingVerificationId, setSendingVerificationId] = useState(null);
  const [updatingLeadId, setUpdatingLeadId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Custom Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    recipientEmail: '',
    recipientName: '',
    subject: '',
    message: ''
  });
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.studyCountry]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchLeads();
    }, filters.search ? 400 : 0);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching leads with filters:', filters);
      const response = await apiClient.get('/api/leads', {
        params: {
          status: filters.status || undefined,
          studyCountry: filters.studyCountry || undefined,
          search: filters.search || undefined
        }
      });
      console.log('Leads fetched successfully:', response.data);
      setLeads(response.data.leads || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load leads.';
      // DEBUG: Show where we are trying to connect
      const apiUrl = apiClient.defaults.baseURL || 'Relative Path (Proxy)';
      setError(`${errorMessage} (API: ${apiUrl})`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearchChange = (event) => {
    setFilters((prev) => ({ ...prev, search: event.target.value }));
  };

  const handleStatusFilterChange = (event) => {
    setFilters((prev) => ({ ...prev, status: event.target.value }));
  };

  const handleCountryFilterChange = (event) => {
    setFilters((prev) => ({ ...prev, studyCountry: event.target.value }));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeads();
  };

  const handleMarkContacted = async (leadId) => {
    try {
      setUpdatingLeadId(leadId);
      setError('');
      await apiClient.patch(`/api/leads/${leadId}`, { markContacted: true, status: 'contacted' });
      setSuccessMessage('Lead marked as contacted.');
      fetchLeads();
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to update lead.';
      setError(message);
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const handleStatusChange = async (leadId, status) => {
    try {
      setUpdatingLeadId(leadId);
      setError('');
      await apiClient.patch(`/api/leads/${leadId}`, { status });
      setSuccessMessage('Lead status updated.');
      fetchLeads();
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to update lead status.';
      setError(message);
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const handleSendVerification = async (leadId) => {
    try {
      setSendingVerificationId(leadId);
      setError('');
      const response = await apiClient.post(`/api/leads/${leadId}/send-verification`);
      setSuccessMessage(response.data.message || 'Verification link sent successfully.');
      fetchLeads();
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to send verification email.';
      setError(message);
    } finally {
      setSendingVerificationId(null);
    }
  };

  const handleOpenEmailModal = (lead) => {
    setEmailData({
      recipientEmail: lead.email,
      recipientName: lead.fullName,
      subject: 'Update on your Enquiry - Kubera',
      message: `Dear ${lead.fullName},\n\nWe have reviewed your enquiry for loan assistance.\n\nPlease find the next steps below:\n\n[Your Message Here]\n\nBest regards,\nKubera Team`
    });
    setShowEmailModal(true);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setSendingEmail(true);
    try {
      console.log('Sending email to:', emailData.recipientEmail);
      // Use apiClient instead of axios to include auth headers
      await apiClient.post('/api/admin/send-email', {
        email: emailData.recipientEmail,
        subject: emailData.subject,
        message: emailData.message
      });
      setSuccessMessage('Custom email sent successfully!');
      setShowEmailModal(false);
    } catch (error) {
      console.error('Error sending email:', error);
      setError('Failed to send email.');
    } finally {
      setSendingEmail(false);
    }
  };

  const countryOptions = useMemo(() => {
    const uniqueCountries = new Set(leads.map((lead) => lead.studyCountry).filter(Boolean));
    return Array.from(uniqueCountries).sort();
  }, [leads]);

  return (
    <div>
      <style>{`
        @keyframes loaderSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={headerStyle}>
        <div>
          <h1 style={pageTitleStyle}>Student Leads</h1>
          <p style={pageSubtitleStyle}>Monitor enquiries, action follow-ups, and trigger verification for ready cases.</p>
        </div>
        <button onClick={handleRefresh} style={refreshButtonStyle} disabled={refreshing}>
          {refreshing ? <Loader2 size={18} style={spinnerStyle} /> : <RefreshCw size={18} />}
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {(error || successMessage) && (
        <div style={{ marginBottom: '1rem' }}>
          {error && (
            <div style={errorAlertStyle}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div style={successAlertStyle}>
              <CheckCircle size={18} />
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage('')}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#166534' }}
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}

      <div style={filtersBarStyle}>
        <div style={searchWrapperStyle}>
          <Search size={18} style={searchIconStyle} />
          <input
            type="text"
            placeholder="Search by name, email, phone or university"
            value={filters.search}
            onChange={handleSearchChange}
            style={searchInputStyle}
          />
        </div>
        <select value={filters.status} onChange={handleStatusFilterChange} style={filterSelectStyle}>
          <option value="">All statuses</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select value={filters.studyCountry} onChange={handleCountryFilterChange} style={filterSelectStyle}>
          <option value="">All destinations</option>
          {countryOptions.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={loadingStateStyle}>
          <Loader2 size={28} style={spinnerStyle} />
          <span>Loading leads...</span>
        </div>
      ) : leads.length === 0 ? (
        <div style={emptyStateStyle}>
          <GlobeIcon />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>No leads yet</h3>
          <p style={{ color: '#64748b' }}>
            Once students submit the eligibility form, they will appear here for follow-up and verification.
          </p>
        </div>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Lead</th>
                <th style={thStyle}>Preferences</th>
                <th style={thStyle}>Loan Need</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Last Contacted</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} style={tbodyRowStyle}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{lead.fullName}</span>
                      <span style={leadDetailStyle}>
                        <Mail size={14} /> {lead.email}
                      </span>
                      {lead.phone && (
                        <span style={leadDetailStyle}>
                          <Phone size={14} /> {lead.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <span style={leadDetailStyle}>
                        <GlobeIcon size={14} /> {lead.studyCountry || '—'}
                      </span>
                      <span style={leadDetailStyle}>
                        <GraduationIcon size={14} /> {lead.universityPreference || '—'}
                      </span>
                      <span style={leadDetailStyle}>
                        <Clock size={14} /> {lead.intake || '—'}
                      </span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{lead.loanRange || '—'}</span>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                      {admissionStatusMap[lead.admissionStatus] || lead.admissionStatus || 'Status pending'}
                    </p>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <StatusBadge status={lead.status} />
                      <select
                        value={lead.status}
                        onChange={(event) => handleStatusChange(lead.id, event.target.value)}
                        style={statusSelectStyle}
                        disabled={updatingLeadId === lead.id}
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td style={tdStyle}>{formatDate(lead.lastContactedAt) || 'Never'}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleOpenEmailModal(lead)}
                        title="Send Custom Mail"
                        style={{
                          padding: '0.55rem',
                          borderRadius: '0.65rem',
                          border: '1px solid #94a3b8',
                          backgroundColor: 'white',
                          color: '#0f766e',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Mail size={16} />
                      </button>
                      <button
                        onClick={() => handleMarkContacted(lead.id)}
                        style={secondaryActionButtonStyle}
                        disabled={updatingLeadId === lead.id}
                      >
                        {updatingLeadId === lead.id ? <Loader2 size={16} style={spinnerStyle} /> : <Phone size={16} />}
                        <span>Mark Contacted</span>
                      </button>
                      <button
                        onClick={() => handleSendVerification(lead.id)}
                        style={primaryActionButtonStyle}
                        disabled={sendingVerificationId === lead.id}
                      >
                        {sendingVerificationId === lead.id ? <Loader2 size={16} style={spinnerStyle} /> : <Send size={16} />}
                        <span>Send Verification</span>
                      </button>
                    </div>
                    {lead.verificationSentAt && (
                      <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                        Sent on {formatDate(lead.verificationSentAt)} by {lead.verificationSentBy || '—'}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Email Modal */}
          {showEmailModal && (
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
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                padding: '2rem',
                width: '90%',
                maxWidth: '600px',
                position: 'relative'
              }}>
                <button
                  onClick={() => setShowEmailModal(false)}
                  style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  <X size={24} />
                </button>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Mail size={24} color="#064e3b" />
                  Send Email
                </h2>
                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #dcfce7' }}>
                  <p style={{ fontSize: '0.875rem', color: '#166534', fontWeight: 500 }}>
                    To: {emailData.recipientName} ({emailData.recipientEmail})
                  </p>
                </div>
                <form onSubmit={handleSendEmail}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Subject</label>
                      <input
                        type="text"
                        placeholder="Email Subject"
                        value={emailData.subject}
                        onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                        required
                        style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', width: '100%' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Message</label>
                      <textarea
                        placeholder="Type your message here..."
                        value={emailData.message}
                        onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                        required
                        rows={8}
                        style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', width: '100%', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(false)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        backgroundColor: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sendingEmail}
                      style={{
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        backgroundColor: '#064e3b',
                        color: 'white',
                        cursor: sendingEmail ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: sendingEmail ? 0.7 : 1
                      }}
                    >
                      {sendingEmail ? 'Sending...' : 'Send Mail'}
                      {!sendingEmail && <Mail size={18} />}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
          }
        </div>
      )}
    </div>
  );
}

function GlobeIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2c2.5 3 2.5 17 0 20" />
    <path d="M12 2c-2.5 3-2.5 17 0 20" />
  </svg>;
}

function GraduationIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="1.8">
      <path d="M22 12l-10-7-10 7 10 7 10-7z" />
      <path d="M22 12l-10 7-10-7" />
      <path d="M6 15v4h12v-4" />
    </svg>
  );
}

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '2rem'
};

const pageTitleStyle = {
  fontSize: '2rem',
  fontWeight: 700,
  color: '#0f172a'
};

const pageSubtitleStyle = {
  color: '#64748b',
  marginTop: '0.5rem'
};

const refreshButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  backgroundColor: '#eff6ff',
  border: '1px solid #2563eb',
  color: '#1d4ed8',
  borderRadius: '0.75rem',
  padding: '0.6rem 1rem',
  cursor: 'pointer',
  fontWeight: 600
};

const filtersBarStyle = {
  display: 'flex',
  gap: '1rem',
  flexWrap: 'wrap',
  marginBottom: '1.5rem'
};

const searchWrapperStyle = {
  position: 'relative',
  flex: '1 1 280px'
};

const searchIconStyle = {
  position: 'absolute',
  left: '0.75rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#94a3b8'
};

const searchInputStyle = {
  width: '100%',
  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
  borderRadius: '0.75rem',
  border: '1px solid #cbd5f5',
  backgroundColor: '#f8fafc',
  outline: 'none'
};

const filterSelectStyle = {
  padding: '0.75rem 1rem',
  borderRadius: '0.75rem',
  border: '1px solid #e2e8f0',
  backgroundColor: 'white',
  minWidth: '180px'
};

const tableWrapperStyle = {
  borderRadius: '1rem',
  border: '1px solid #e2e8f0',
  backgroundColor: 'white',
  overflow: 'hidden'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0
};

const thStyle = {
  textAlign: 'left',
  padding: '1rem',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#475569',
  backgroundColor: '#f8fafc',
  borderBottom: '1px solid #e2e8f0'
};

const tbodyRowStyle = {
  borderBottom: '1px solid #f1f5f9'
};

const tdStyle = {
  padding: '1.1rem',
  verticalAlign: 'top'
};

const leadDetailStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.45rem',
  color: '#64748b',
  fontSize: '0.87rem'
};

const statusSelectStyle = {
  padding: '0.55rem 0.7rem',
  borderRadius: '0.65rem',
  border: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
  fontSize: '0.8rem'
};

const primaryActionButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  borderRadius: '0.65rem',
  border: 'none',
  padding: '0.55rem 0.85rem',
  background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
  color: 'white',
  fontSize: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer'
};

const secondaryActionButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  borderRadius: '0.65rem',
  border: '1px solid #94a3b8',
  padding: '0.55rem 0.85rem',
  backgroundColor: 'white',
  color: '#1f2937',
  fontSize: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer'
};

const loadingStateStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '2rem',
  color: '#475569'
};

const emptyStateStyle = {
  border: '1px dashed #cbd5f5',
  borderRadius: '1rem',
  padding: '3rem',
  textAlign: 'center',
  backgroundColor: '#f8fafc'
};

const errorAlertStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  borderRadius: '0.75rem',
  backgroundColor: '#fee2e2',
  color: '#b91c1c',
  padding: '0.8rem 1rem',
  border: '1px solid #fca5a5',
  marginBottom: '0.75rem'
};

const successAlertStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  borderRadius: '0.75rem',
  backgroundColor: '#dcfce7',
  color: '#166534',
  padding: '0.8rem 1rem',
  border: '1px solid #86efac'
};

export default Leads;

