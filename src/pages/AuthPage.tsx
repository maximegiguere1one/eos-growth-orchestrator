
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/contexts/AuthProvider';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, isLoading, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && user) {
      navigate('/', { replace: true });
    }
  }, [user, isInitialized, navigate]);

  if (!isInitialized || isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <AuthForm />
    </div>
  );
}
