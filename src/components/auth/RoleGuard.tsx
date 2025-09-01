import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldX } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole: 'admin' | 'manager' | 'user';
  fallback?: ReactNode;
}

export function RoleGuard({ children, requiredRole, fallback }: RoleGuardProps) {
  const { user, loading: authLoading } = useAuth();

  const { data: userRoles, isLoading: rolesLoading, error } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data?.map(r => r.role) || [];
    },
    enabled: !!user?.id,
  });

  // Show loading state while checking auth or roles
  if (authLoading || rolesLoading) {
    return <LoadingSkeleton />;
  }

  // Handle errors
  if (error) {
    return (
      <Alert variant="destructive">
        <ShieldX className="h-4 w-4" />
        <AlertDescription>
          Unable to verify permissions. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  // Check if user has the required role
  const hasRequiredRole = userRoles?.includes(requiredRole) || false;
  
  // For admin role, also check if they have admin role specifically
  const hasAdminRole = userRoles?.includes('admin') || false;
  
  // Admins can access everything
  const hasAccess = hasAdminRole || hasRequiredRole;

  if (!hasAccess) {
    return fallback || (
      <Alert>
        <ShieldX className="h-4 w-4" />
        <AlertDescription>
          You don't have the required permissions to access this area.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}