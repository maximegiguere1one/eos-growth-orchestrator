
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/contexts/AuthProvider';
import { PageLoader } from '@/components/common/PageLoader';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && user) {
      // Redirect to intended location or default to dashboard
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, isInitialized, navigate, location.state]);

  if (!isInitialized) {
    return <PageLoader variant="minimal" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <AuthForm />
    </div>
  );
}
