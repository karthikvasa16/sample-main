import React from 'react';
import { Plane } from 'lucide-react';

function HeroAnimation() {
  return (
    <div style={{
      position: 'relative',
      width: '150px', // Further reduced size
      height: '150px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 50%, #a7f3d0 100%)',
      boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
      border: '4px solid #f59e0b'
    }}>
      <style>{`
        @keyframes flyDiagonal {
          0% {
            offset-distance: 0%;
            opacity: 0;
            transform: scale(0.5);
          }
          20% {
            opacity: 1;
            transform: scale(1);
          }
          80% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            offset-distance: 100%;
            opacity: 0;
            transform: scale(0.5);
          }
        }

        @keyframes pulseText {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .plane-diagonal {
          /* Path: Bottom-Left (15, 135) to Top-Right (135, 15) scaled for 150px box */
          offset-path: path('M 15 135 Q 75 75, 135 15');
          animation: flyDiagonal 2.5s ease-in-out infinite;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10;
          pointer-events: none;
        }
      `}</style>

      {/* Background Path Line */}
      <svg width="150" height="150" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', opacity: 0.3 }}>
        <path
          d="M 15 135 Q 75 75, 135 15"
          fill="none"
          stroke="#059669"
          strokeWidth="2"
          strokeDasharray="3 3"
        />
      </svg>

      {/* Airplane Object */}
      <div className="plane-diagonal">
        <div style={{
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(90deg)'
        }}>
          <Plane size={16} color="#065f46" fill="#fff" />
        </div>
      </div>

      {/* Text Content */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', animation: 'pulseText 2s ease-in-out infinite' }}>
        <h1 style={{
          fontSize: '2.5rem', // Adjusted font size
          fontWeight: '800',
          color: '#064e3b',
          margin: 0,
          lineHeight: 1,
        }}>
          FUD
        </h1>
        <p style={{
          fontSize: '0.6rem', // Adjusted font size
          fontWeight: '600',
          color: '#047857',
          margin: '0.2rem 0 0',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          Fund Your Dreams
        </p>
      </div>

    </div>
  );
}

export default HeroAnimation;
