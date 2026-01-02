import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '../config/axios';
import {
  Search,
  Bell,
  FileText,
  Clock,
  CheckCircle,
  DollarSign,
  MoreVertical,
  TrendingUp,
  AlertCircle,
  Calendar,
  XCircle,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Helper for formatting currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Helper for formatting date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

function StatCard({ title, value, subtitle, icon: Icon, color, bg }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>{title}</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>{value}</h3>
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '1rem',
          backgroundColor: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color
        }}>
          <Icon size={24} />
        </div>
      </div>
      <div>
        <p style={{ fontSize: '0.8125rem', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <TrendingUp size={14} />
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Calculate Stats
  const stats = useMemo(() => {
    const total = loans.length;
    const pending = loans.filter(l => l.status === 'Pending').length;
    const approved = loans.filter(l => l.status === 'Approved').length;
    const disbursedAmount = loans
      .filter(l => l.status === 'Approved')
      .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

    return { total, pending, approved, disbursedAmount };
  }, [loans]);

  // Recent Activity (Mocked from loan data for now as per requirement to look like the image)
  const recentActivity = useMemo(() => {
    return loans.slice(0, 4).map(loan => ({
      id: loan.id,
      title: `Application ${loan.status.toLowerCase()}`,
      student: loan.studentName,
      time: new Date(loan.updatedAt || loan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: loan.status
    }));
  }, [loans]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #15803d', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* 1. Header Section (Welcome) */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Welcome back, {user?.name || 'Admin'}. Here's what's happening today.</p>
      </div>

      {/* 2. Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          title="Total Applications"
          value={stats.total}
          subtitle="Updated just now"
          icon={FileText}
          color="#15803d"
          bg="white"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending}
          subtitle={`${stats.pending} waiting for action`}
          icon={Clock}
          color="#d97706"
          bg="#fffbeb"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          subtitle="Successfully processed"
          icon={CheckCircle}
          color="#15803d"
          bg="#ecfdf5"
        />
        <StatCard
          title="Total Disbursed"
          value={formatCurrency(stats.disbursedAmount)} // Using currency formatter
          subtitle="Cumulative amount"
          icon={DollarSign}
          color="#2563eb"
          bg="#eff6ff"
        />
      </div>

      {/* 3. Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>

        {/* Left Column: Recent Applications */}
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Recent Applications</h2>
            <button style={{ color: '#15803d', fontSize: '0.875rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View all</button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Application</th>
                  <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student</th>
                  <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>University</th>
                  <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.slice(0, 5).map((loan) => (
                  <tr key={loan.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#2563eb', fontSize: '0.875rem' }}>
                      {loan.applicationId || `#${loan.id}`}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                          {loan.studentName ? loan.studentName.charAt(0) : 'U'}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{loan.studentName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{loan.email || 'student@example.com'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>{loan.universityName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{loan.course}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                      {formatCurrency(loan.amount)}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: loan.status === 'Approved' ? '#ecfdf5' : loan.status === 'Rejected' ? '#fef2f2' : '#fffbeb',
                        color: loan.status === 'Approved' ? '#15803d' : loan.status === 'Rejected' ? '#b91c1c' : '#b45309',
                      }}>
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Activity & Processing Time */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Recent Activity */}
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Recent Activity</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {recentActivity.map((activity, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: activity.status === 'Approved' ? '#ecfdf5' : activity.status === 'Rejected' ? '#fef2f2' : '#f0f9ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {activity.status === 'Approved' ? <CheckCircle size={14} color="#15803d" /> :
                      activity.status === 'Rejected' ? <XCircle size={14} color="#b91c1c" /> :
                        <FileText size={14} color="#0284c7" />}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>{activity.title}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{activity.student} • <span style={{ color: '#94a3b8' }}>{activity.time}</span></p>
                  </div>
                </div>
              ))}
              <button style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                View all activity
              </button>
            </div>
          </div>

          {/* Processing Time */}
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Processing Time</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={28} color="#2563eb" />
              </div>
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>5.2</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Average days to process</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;
