import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../config/axios';
import {
    ArrowLeft,
    MapPin,
    Mail,
    Phone,
    GraduationCap,
    Calendar,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Send
} from 'lucide-react';

function ApplicationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApplication = async () => {
            try {
                // Fetch from the dedicated loan details endpoint
                const response = await apiClient.get(`/api/loans/${id}`);
                setApplication(response.data);
            } catch (err) {
                console.error('Error fetching application details:', err);
                setError('Failed to load application details.');
            } finally {
                setLoading(false);
            }
        };
        fetchApplication();
    }, [id]);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading details...</div>;
    if (error || !application) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error || 'Application not found'}</div>;

    const getStatusBadge = (status) => {
        const colors = {
            'Pending': { bg: '#fff7ed', text: '#c2410c' },
            'Under Review': { bg: '#eff6ff', text: '#1d4ed8' },
            'Approved': { bg: '#ecfdf5', text: '#15803d' },
            'Rejected': { bg: '#fef2f2', text: '#b91c1c' },
            'Docs Required': { bg: '#fefce8', text: '#a16207' }
        };
        const style = colors[status] || { bg: '#f1f5f9', text: '#475569' };
        return (
            <span style={{
                backgroundColor: style.bg,
                color: style.text,
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600
            }}>
                {status}
            </span>
        );
    };

    return (
        <div style={{ paddingBottom: '2rem' }}>

            {/* Top Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                        Application {application.applicationId || `LA-2024-${application.id}`}
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        Submitted on {new Date(application.appliedDate || application.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Back Button */}
            <button
                onClick={() => navigate('/admin/applications')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: '#475569',
                    cursor: 'pointer',
                    marginBottom: '1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 500
                }}
            >
                <ArrowLeft size={16} /> Back to Applications
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem' }}>

                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Student Info Card */}
                    <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>Student Information</h2>
                            {getStatusBadge(application.status)}
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                backgroundColor: '#eff6ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#2563eb',
                                fontSize: '1.5rem',
                                fontWeight: 600,
                                flexShrink: 0
                            }}>
                                {application.studentName?.charAt(0) || 'S'}
                            </div>

                            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>{application.studentName}</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{application.course}</p>

                                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem' }}>
                                            <Mail size={16} /> {application.email || application.studentEmail}
                                        </div>
                                        {application.applicantCountry && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem' }}>
                                                <MapPin size={16} /> {application.applicantCountry}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                            <Phone size={16} /> {application.phone || '+91 98765 43210'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#475569', fontSize: '0.9rem' }}>
                                            <GraduationCap size={16} style={{ marginTop: '3px' }} />
                                            <span>{application.universityName}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loan Details Card */}
                    <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.5rem' }}>Loan Details</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.75rem' }}>
                                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Loan Amount</p>
                                <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>₹{Number(application.amount).toLocaleString()}</p>
                            </div>
                            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.75rem' }}>
                                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Duration</p>
                                <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>{application.duration} Months</p>
                            </div>
                            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.75rem' }}>
                                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Purpose</p>
                                <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>{application.purpose || 'Education'}</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>PAN Number</p>
                                <p style={{ fontSize: '1rem', fontWeight: 500, color: '#334155', fontFamily: 'monospace' }}>{application.pan || '—'}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>CIBIL Score</p>
                                <p style={{ fontSize: '1rem', fontWeight: 600, color: application.cibilScore >= 750 ? '#15803d' : '#b45309' }}>{application.cibilScore || '—'}</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Actions Card */}
                    <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.5rem' }}>Actions</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                backgroundColor: '#2563eb', color: 'white', border: 'none',
                                fontWeight: 600, cursor: 'pointer'
                            }}>
                                <CheckCircle size={18} /> Approve Application
                            </button>

                            <button style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                backgroundColor: '#ef4444', color: 'white', border: 'none',
                                fontWeight: 600, cursor: 'pointer'
                            }}>
                                <XCircle size={18} /> Reject Application
                            </button>

                            <button style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                backgroundColor: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0',
                                fontWeight: 500, cursor: 'pointer'
                            }}>
                                <AlertTriangle size={18} /> Request Documents
                            </button>

                            <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '0.5rem 0' }} />

                            <button style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                backgroundColor: 'white', color: '#0f172a', border: '1px solid #e2e8f0',
                                fontWeight: 500, cursor: 'pointer'
                            }}>
                                <Send size={18} /> Send Email
                            </button>
                        </div>
                    </div>

                    {/* Timeline Card (Placeholder) */}
                    <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>Timeline</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <div style={{ width: '2px', backgroundColor: '#e2e8f0', marginLeft: '0.4rem', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: 0, left: '-4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 500, fontSize: '0.9rem', color: '#0f172a' }}>Application Submitted</p>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(application.appliedDate || application.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            {/* Add more events dynamically if data exists */}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default ApplicationDetails;
