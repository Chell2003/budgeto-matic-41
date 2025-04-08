
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wallet, BarChart3, LineChart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Transactions', path: '/expenses', icon: Wallet },
    { name: 'Budget', path: '/budget', icon: BarChart3 },
    { name: 'Insights', path: '/insights', icon: LineChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 w-full max-w-md mx-auto z-50">
      <div className="glass border-t border-gray-100 px-2 pt-2 pb-safe">
        <nav className="flex justify-around">
          {navItems.map((item) => {
            // Check if current location path matches this nav item path
            // For the dashboard, we need to handle both '/' and '/dashboard'
            const isActive = 
              (item.path === '/' && (location.pathname === '/' || location.pathname === '/dashboard')) ||
              (item.path !== '/' && location.pathname === item.path);
              
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex flex-col items-center px-3 py-2 rounded-xl",
                  isActive 
                    ? "text-primary font-medium" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon size={22} className={cn(
                  "mb-1 transition-all duration-200",
                  isActive ? "scale-105" : "scale-100"
                )} />
                <span className="text-xs">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default BottomNavigation;
