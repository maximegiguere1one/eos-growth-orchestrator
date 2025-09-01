
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

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.email);

        if (session?.user) {
          // Get updated user data
          try {
            const authUser = await authService.getCurrentUser();
            setUser(authUser);
          } catch (error) {
            console.error('Error getting current user:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }

        setLoading(false);
        if (!isInitialized) {
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
          setInitialized(true);
        }
      })
      .catch((error) => {
        console.error('Error getting initial user:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
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
      await authService.signIn(email, password);
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
      await authService.signOut();
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

