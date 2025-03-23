
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/use-auth';

const Auth: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center p-4 bg-background">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Finance App</h1>
        <p className="text-muted-foreground">Manage your finances with ease</p>
      </div>
      
      <AuthForm />
      
      <p className="mt-8 text-center text-sm text-muted-foreground">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};

export default Auth;
