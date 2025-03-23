
import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface AnimatedTransitionProps {
  children: React.ReactNode;
}

const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({ children }) => {
  const location = useLocation();
  const prevPathRef = useRef<string>(location.pathname);
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      if (elementRef.current) {
        elementRef.current.classList.add('animate-fade-out');
        
        const timeout = setTimeout(() => {
          if (elementRef.current) {
            elementRef.current.classList.remove('animate-fade-out');
            elementRef.current.classList.add('animate-fade-in');
            
            const cleanupTimeout = setTimeout(() => {
              if (elementRef.current) {
                elementRef.current.classList.remove('animate-fade-in');
              }
            }, 300);
            
            return () => clearTimeout(cleanupTimeout);
          }
        }, 150);
        
        return () => clearTimeout(timeout);
      }
    }
    
    prevPathRef.current = location.pathname;
  }, [location.pathname]);
  
  return (
    <div ref={elementRef} className="min-h-[85vh]">
      {children}
    </div>
  );
};

export default AnimatedTransition;
