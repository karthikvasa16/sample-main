import React, { useEffect, useState } from 'react';
import HeroAnimation from './HeroAnimation';

function SplashScreen({ onComplete }) {
    const [isVisible, setIsVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
        // Show for 2.5 seconds total
        const timer = setTimeout(() => {
            setIsVisible(false); // Start fade out
            if (onComplete) onComplete();
        }, 2500);

        const removeTimer = setTimeout(() => {
            setShouldRender(false); // Unmount after fade out
        }, 3000); // +500ms for transition

        return () => {
            clearTimeout(timer);
            clearTimeout(removeTimer);
        };
    }, [onComplete]);

    if (!shouldRender) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(255, 255, 255, 0.4)', // Semi-transparent white
            backdropFilter: 'blur(10px)', // Blur effect
            WebkitBackdropFilter: 'blur(10px)', // Safari support
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.5s ease-out',
            pointerEvents: isVisible ? 'auto' : 'none'
        }}>
            <HeroAnimation />
        </div>
    );
}

export default SplashScreen;
