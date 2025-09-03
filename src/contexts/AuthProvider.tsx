
import { createContext, useContext, useEffect, ReactNode } from 'react';
import { authService, type AuthUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

interface AuthContextValue {
  user: AuthUser;
  isLoading: boolean;
  isInitialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isLoading, isInitialized, setUser, setLoading, setInitialized, clearAuth } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener (SYNCHRONOUS callback to prevent deadlocks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.email);

        // Synchronous state updates only
        if (session?.user) {
          setUser(session.user as any); // Temporary direct assignment
          // Defer Supabase calls to prevent deadlocks
          setTimeout(async () => {
            if (!mounted) return;
            try {
              const authUser = await authService.getCurrentUser();
              if (mounted) setUser(authUser);
            } catch (error) {
              console.error('Error getting current user:', error);
              if (mounted) setUser(null);
            }
          }, 0);
        } else {
          setUser(null);
        }

        setLoading(false);
        if (!isInitialized) {
          console.log('Auth initialized with user:', session?.user?.email || 'none');
          setInitialized(true);
        }
      }
    );

    // Get initial session
    authService.getCurrentUser()
      .then((authUser) => {
        if (mounted) {
          setUser(authUser);
          setLoading(false);
          console.log('Auth initialized with user:', authUser?.email || 'none');
          setInitialized(true);
        }
      })
      .catch((error) => {
        console.error('Error getting initial user:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
          console.log('Auth initialized with no user');
          setInitialized(true);
        }
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setLoading, setInitialized, isInitialized]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { performCleanSignIn } = await import('@/lib/authCleanup');
      await performCleanSignIn(async () => {
        await authService.signIn(email, password);
      });
      // User state will be updated by the auth state change listener
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      await authService.signUp(email, password, displayName);
      // User state will be updated by the auth state change listener
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { performCleanSignOut } = await import('@/lib/authCleanup');
      await performCleanSignOut();
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    isInitialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

