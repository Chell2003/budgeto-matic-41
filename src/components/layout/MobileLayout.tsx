
import React from 'react';
import BottomNavigation from '../navigation/BottomNavigation';
import AnimatedTransition from '../ui/AnimatedTransition';

interface MobileLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, currentPage }) => {
  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-background overflow-hidden">
      <div className="relative z-10 h-full pb-16">
        <AnimatedTransition>
          <main className="px-4 pt-6 pb-8">
            {children}
          </main>
        </AnimatedTransition>
      </div>
      
      <BottomNavigation currentPage={currentPage}/>
    </div>
  );
};

export default MobileLayout;
