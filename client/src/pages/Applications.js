import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../config/axios';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Bell,
  Eye,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const statusColors = {
  'Pending': { bg: '#fff7ed', text: '#c2410c' },
  'Under Review': { bg: '#eff6ff', text: '#1d4ed8' },
  'Approved': { bg: '#ecfdf5', text: '#15803d' },
  'Rejected': { bg: '#fef2f2', text: '#b91c1c' },
  'Docs Required': { bg: '#fefce8', text: '#a16207' }
};

function Applications() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Action Menu State
  const [activeMenuId, setActiveMenuId] = useState(null);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await apiClient.get('/api/loans/all');
        setLoans(response.data.loans || []);
      } catch (error) {
        console.error('Error fetching loans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  // Stats for tabs
  const stats = useMemo(() => {
    const counts = {
      All: loans.length,
      Pending: 0,
      'Under Review': 0,
      Approved: 0,
      Rejected: 0,
      'Docs Required': 0
    };
    loans.forEach(loan => {
      if (counts[loan.status] !== undefined) {
        counts[loan.status]++;
      }
    });
    return counts;
  }, [loans]);

  // Filtering
  const filteredLoans = useMemo(() => {
    return loans.filter(loan => {
      const matchesStatus = filterStatus === 'All' || loan.status === filterStatus;
      const matchesSearch =
        loan.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.applicationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.universityName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [loans, filterStatus, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLoans.slice(start, start + itemsPerPage);
  }, [currentPage, filteredLoans]);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [filterStatus, searchTerm]);

  const tabs = [
    { label: 'All', value: 'All' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Under Review', value: 'Under Review' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Docs Required', value: 'Docs Required' }
  ];

  const handleAction = (action, loan) => {
    if (action === 'email') {
      window.location.href = `mailto:${loan.email || loan.studentEmail}`;
    } else if (action === 'call') {
      if (loan.phone) window.location.href = `tel:${loan.phone}`;
      else alert('Phone number not available');
    } else if (action === 'view') {
      navigate(`/admin/applications/${loan.id}`);
    }
    setActiveMenuId(null);
  };

  return (
    <div style={{ padding: '0 0 2rem 0' }}>

      {/* Click outside listener for menu */}
      {activeMenuId && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          onClick={() => setActiveMenuId(null)}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Applications</h1>
        <p style={{ color: '#64748b' }}>Manage and review loan applications</p>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>

        {/* Toolbar */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Search */}
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                  color: '#0f172a'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: 500 }}>
                <BellIcon />
                <span style={{ fontSize: '0.9rem' }}>Today: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Filter & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                <Filter size={16} /> Filter by status:
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #2563eb',
                  color: '#2563eb',
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer',
                  backgroundColor: 'white'
                }}
              >
                {tabs.map(tab => <option key={tab.value} value={tab.value}>{tab.label} ({stats[tab.value] || 0})</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                color: '#334155',
                fontWeight: 500,
                cursor: 'pointer'
              }}>
                <Download size={16} /> Export
              </button>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                fontWeight: 500,
                cursor: 'pointer'
              }}>
                <Plus size={16} /> New Application
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: filterStatus === tab.value ? '#2563eb' : '#f1f5f9',
                  color: filterStatus === tab.value ? 'white' : '#64748b',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {tab.label}
                <span style={{
                  backgroundColor: filterStatus === tab.value ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                  padding: '0.1rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem'
                }}>
                  {stats[tab.value] || 0}
                </span>
              </button>
            ))}
          </div>

        </div>

        {/* Table */}
        <div style={{ overflowX: 'visible' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Application</th>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Student</th>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>University</th>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Status</th>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Submitted</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading applications...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No applications found.</td></tr>
              ) : (
                currentItems.map(loan => (
                  <tr key={loan.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background-color 0.2s', position: 'relative' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.9rem' }}>{loan.applicationId || `LA-2024-${loan.id.toString().padStart(3, '0')}`}</span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 600, fontSize: '0.8rem' }}>
                          {loan.studentName ? loan.studentName.charAt(0) : 'U'}
                        </div>
                        <div>
                          <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>{loan.studentName}</div>
                          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{loan.email || 'student@example.com'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ color: '#0f172a', fontWeight: 500, fontSize: '0.9rem' }}>{loan.universityName}</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{loan.course}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#0f172a' }}>
                      ₹{(Number(loan.amount) || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        backgroundColor: statusColors[loan.status]?.bg || '#f1f5f9',
                        color: statusColors[loan.status]?.text || '#475569'
                      }}>
                        {loan.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                        {new Date(loan.appliedDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', position: 'relative' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === loan.id ? null : loan.id);
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: activeMenuId === loan.id ? '#0f172a' : '#94a3b8' }}
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      {/* Action Dropdown */}
                      {activeMenuId === loan.id && (
                        <div style={{
                          position: 'absolute',
                          right: '1.5rem',
                          top: '70%',
                          width: '180px',
                          backgroundColor: 'white',
                          borderRadius: '0.75rem',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                          border: '1px solid #f1f5f9',
                          zIndex: 50,
                          padding: '0.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem'
                        }}>
                          <button onClick={() => handleAction('view', loan)} style={menuItemStyle}>
                            <Eye size={16} /> View Details
                          </button>
                          <button onClick={() => handleAction('email', loan)} style={menuItemStyle}>
                            <Mail size={16} /> Send Email
                          </button>
                          <button onClick={() => handleAction('call', loan)} style={menuItemStyle}>
                            <Phone size={16} /> Call Student
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredLoans.length > 0 && (
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Showing <span style={{ fontWeight: 600, color: '#0f172a' }}>{currentItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span style={{ fontWeight: 600, color: '#0f172a' }}>{Math.min(currentPage * itemsPerPage, filteredLoans.length)}</span> of <span style={{ fontWeight: 600, color: '#0f172a' }}>{filteredLoans.length}</span> results
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ ...paginationButtonStyle, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  p = currentPage - 2 + i;
                  if (p > totalPages) p = totalPages - (4 - i);
                }
                if (p <= 0) p = 1;

                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    style={{
                      ...paginationButtonStyle,
                      backgroundColor: currentPage === p ? '#eff6ff' : 'white',
                      color: currentPage === p ? '#2563eb' : '#64748b',
                      borderColor: currentPage === p ? '#2563eb' : '#e2e8f0',
                    }}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ ...paginationButtonStyle, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const menuItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.625rem 0.75rem',
  borderRadius: '0.5rem',
  border: 'none',
  backgroundColor: 'transparent',
  color: '#475569',
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  textAlign: 'left',
  width: '100%',
  outline: 'none',
  ':hover': {
    backgroundColor: '#f8fafc',
    color: '#0f172a'
  }
};

const paginationButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 1rem',
  border: '1px solid #e2e8f0',
  borderRadius: '0.5rem',
  background: 'white',
  color: '#64748b',
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer'
};

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export default Applications;
