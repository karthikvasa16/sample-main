import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, XCircle } from 'lucide-react';

const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" size={20} color="#10b981" />,
    error: <XCircle className="w-5 h-5 text-red-500" size={20} color="#ef4444" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" size={20} color="#f59e0b" />,
    info: <Info className="w-5 h-5 text-blue-500" size={20} color="#3b82f6" />
};

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        background: 'white',
        padding: '1rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        marginBottom: '1rem',
        minWidth: '300px',
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out forwards',
        borderLeft: '4px solid',
        position: 'relative',
        overflow: 'hidden'
    },
    content: {
        marginLeft: '0.75rem',
        flex: 1,
        fontSize: '0.9rem',
        color: '#374151',
        fontWeight: 500
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#9ca3af',
        padding: '0.25rem',
        marginLeft: '0.5rem',
        display: 'flex',
        alignItems: 'center'
    }
};

const borderColors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
};

function Toast({ id, message, type = 'info', onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 4000); // Auto dismiss after 4s

        return () => clearTimeout(timer);
    }, [id, onClose]);

    return (
        <div style={{ ...styles.container, borderLeftColor: borderColors[type] }}>
            <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
            <div>{icons[type]}</div>
            <div style={styles.content}>{message}</div>
            <button style={styles.closeBtn} onClick={() => onClose(id)}>
                <X size={16} />
            </button>
        </div>
    );
}

export default Toast;
