
import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import IncomeSourceSelector from '@/components/settings/IncomeSourceSelector';
import SavingsAllocationManager from '@/components/settings/SavingsAllocationManager';
import { Profile } from '@/types/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Settings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [incomeSource, setIncomeSource] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single() as { data: Profile | null, error: any };
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "row not found" error
          throw error;
        }
        
        if (profile) {
          setFullName(profile.full_name || "");
          setUsername(profile.username || "");
          setIncomeSource(profile.income_source || "");
        }
        
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          full_name: fullName,
          username: username,
          income_source: incomeSource,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
    }
  };

  const getInitials = () => {
    return fullName
      ? fullName
          .split(' ')
          .map((name) => name[0])
          .join('')
          .toUpperCase()
      : username
      ? username[0].toUpperCase()
      : "U";
  };

  return (
    <MobileLayout currentPage="settings">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </header>
      
      <div className="space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" />
              <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{fullName || username || "User"}</CardTitle>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                  disabled={isLoading}
                />
              </div>
              
              <IncomeSourceSelector
                currentSource={incomeSource}
                onSourceChange={setIncomeSource}
              />
              
              <Button 
                onClick={handleSaveProfile} 
                disabled={isSaving || isLoading}
                className="w-full mt-2"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Savings Allocations */}
        <SavingsAllocationManager />
        
        {/* Sign Out Button */}
        <Card>
          <CardContent className="pt-6">
            <Button 
              variant="destructive" 
              onClick={handleSignOut}
              className="w-full"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default Settings;
