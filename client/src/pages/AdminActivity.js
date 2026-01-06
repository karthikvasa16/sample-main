import React, { useState, useEffect } from 'react';
import apiClient from '../config/axios';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    return date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

function AdminActivity() {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const limit = 20;

    const fetchActivities = async (currentPage) => {
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.get('/api/admin/activities', {
                params: { page: currentPage, limit }
            });

            // Handle both structure formats (direct array or paginated object)
            // Backend now returns { activities, total, page, limit }
            const data = response.data;
            if (data.activities) {
                setActivities(data.activities);
                setTotalCount(data.total);
                setTotalPages(Math.ceil(data.total / limit));
            } else if (Array.isArray(data)) {
                // Fallback for non-paginated response (if any)
                setActivities(data);
                setTotalCount(data.length);
                setTotalPages(1);
            }
        } catch (err) {
            const message = err.response?.data?.error || err.message || 'Failed to load activity logs';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities(page);
    }, [page]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div style={{ padding: '0 0 2rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '0.75rem',
                        border: '1px solid #86efac',
                        backgroundColor: 'white',
                        color: '#64748b',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>Activity Logs</h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>History of recent system events and actions.</p>
                </div>
            </div>

            {error && (
                <div style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '0.75rem',
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    border: '1px solid #fecaca',
                    marginBottom: '1.5rem'
                }}>
                    {error}
                </div>
            )}

            <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0'
            }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading activities...</div>
                ) : (
                    <>
                        <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '0.875rem' }}>
                                        <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Action</th>
                                        <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>User</th>
                                        <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Details</th>
                                        <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activities.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No activity logs found.</td>
                                        </tr>
                                    )}
                                    {activities.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem 1rem', textTransform: 'capitalize', color: '#0f172a', fontWeight: 500 }}>
                                                {item.action.replace(/_/g, ' ')}
                                            </td>
                                            <td style={{ padding: '1rem 1rem', color: '#2563eb' }}>{item.email || '—'}</td>
                                            <td style={{ padding: '1rem 1rem', color: '#64748b', fontSize: '0.875rem' }}>
                                                {item.metadata && Object.keys(item.metadata).length > 0 ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                        {Object.entries(item.metadata).map(([key, val]) => (
                                                            <div key={key}>
                                                                <span style={{ fontWeight: 500 }}>{key}:</span> {String(val)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem 1rem', color: '#64748b', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                                                {formatDateTime(item.createdAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                    Showing <span style={{ fontWeight: 600, color: '#0f172a' }}>{(page - 1) * limit + 1}</span> to <span style={{ fontWeight: 600, color: '#0f172a' }}>{Math.min(page * limit, totalCount)}</span> of <span style={{ fontWeight: 600, color: '#0f172a' }}>{totalCount}</span> results
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid #86efac',
                                            backgroundColor: page === 1 ? '#f8fafc' : 'white',
                                            color: page === 1 ? '#94a3b8' : '#0f172a',
                                            cursor: page === 1 ? 'not-allowed' : 'pointer',
                                            fontSize: '0.875rem',
                                            fontWeight: 500
                                        }}
                                    >
                                        <ChevronLeft size={16} /> Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === totalPages}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid #86efac',
                                            backgroundColor: page === totalPages ? '#f8fafc' : 'white',
                                            color: page === totalPages ? '#94a3b8' : '#0f172a',
                                            cursor: page === totalPages ? 'not-allowed' : 'pointer',
                                            fontSize: '0.875rem',
                                            fontWeight: 500
                                        }}
                                    >
                                        Next <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminActivity;
