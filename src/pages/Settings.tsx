
import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  BellIcon, CreditCard, DollarSign, GlobeIcon, 
  Lock, LogOut, User, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SettingsItem = ({ 
  icon: Icon, 
  label, 
  description,
  rightElement,
  onClick 
}: { 
  icon: React.ElementType;
  label: string;
  description?: string;
  rightElement?: React.ReactNode;
  onClick?: () => void;
}) => (
  <div 
    className="flex items-center justify-between py-3 cursor-pointer press-effect"
    onClick={onClick}
  >
    <div className="flex items-center">
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-muted mr-3">
        <Icon size={20} className="text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium text-sm">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
    {rightElement || <ChevronRight size={18} className="text-muted-foreground" />}
  </div>
);

const Settings = () => {
  return (
    <MobileLayout currentPage="settings">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Customize your experience</p>
      </header>

      <Card className="bg-white shadow-subtle mb-6">
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mr-4">
              <User size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="font-medium">John Smith</h2>
              <p className="text-sm text-muted-foreground">john.smith@example.com</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">
            PREFERENCES
          </h2>
          <Card className="bg-white shadow-subtle divide-y">
            <CardContent className="p-4 pb-0">
              <SettingsItem 
                icon={BellIcon} 
                label="Notifications" 
                description="Manage your alerts"
              />
            </CardContent>
            <CardContent className="p-4 pb-0">
              <SettingsItem 
                icon={DollarSign} 
                label="Currency" 
                description="USD - US Dollar"
              />
            </CardContent>
            <CardContent className="p-4">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-muted mr-3">
                    <GlobeIcon size={20} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Use dark theme
                    </p>
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">
            PAYMENT METHODS
          </h2>
          <Card className="bg-white shadow-subtle">
            <CardContent className="p-4">
              <SettingsItem 
                icon={CreditCard} 
                label="Manage Payment Methods"
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">
            SECURITY
          </h2>
          <Card className="bg-white shadow-subtle divide-y">
            <CardContent className="p-4 pb-0">
              <SettingsItem 
                icon={Lock} 
                label="Privacy & Security"
              />
            </CardContent>
            <CardContent className="p-4">
              <SettingsItem 
                icon={LogOut} 
                label="Sign Out" 
                rightElement={null}
              />
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-4 pb-8">
          Version 1.0.0
        </p>
      </div>
    </MobileLayout>
  );
};

export default Settings;
