
import React, { useEffect, useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  BellIcon, CreditCard, DollarSign, GlobeIcon, 
  Lock, LogOut, User, ChevronRight, Moon, Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

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
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProfile() {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }
    
    getProfile();
  }, [user]);

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
    }
    return user?.email?.substring(0, 2).toUpperCase() || '?';
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <MobileLayout currentPage="settings">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Customize your experience</p>
      </header>

      <Card className="bg-card shadow-subtle mb-6">
        <CardContent className="p-4">
          <div className="flex items-center">
            <Avatar className="w-14 h-14 mr-4">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium">{profile?.full_name || profile?.username || 'User'}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">
            PREFERENCES
          </h2>
          <Card className="bg-card shadow-subtle divide-y">
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
                description="₱ - Philippine Peso"
              />
            </CardContent>
            <CardContent className="p-4">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-muted mr-3">
                    {theme === 'dark' ? (
                      <Moon size={20} className="text-muted-foreground" />
                    ) : (
                      <Sun size={20} className="text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">
                      {theme === 'dark' ? 'Currently enabled' : 'Currently disabled'}
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">
            ACCOUNT
          </h2>
          <Card className="bg-card shadow-subtle divide-y">
            <CardContent className="p-4 pb-0">
              <SettingsItem 
                icon={User} 
                label="Account Details" 
                description="Manage your personal information"
              />
            </CardContent>
            <CardContent className="p-4">
              <SettingsItem 
                icon={Lock} 
                label="Security" 
                description="Passwords and authentication"
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-card shadow-subtle">
            <CardContent className="p-4">
              <SettingsItem 
                icon={LogOut} 
                label="Log Out" 
                description="Sign out of your account"
                onClick={handleSignOut}
                rightElement={null}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Settings;
