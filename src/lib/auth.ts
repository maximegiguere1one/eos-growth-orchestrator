
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { env } from '@/config/environment';
import { toast } from '@/hooks/use-toast';

export const supabase = createClient<Database>(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  roles: string[];
}

export class AuthService {
  static async signUp(email: string, password: string, displayName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${env.VITE_APP_BASE_URL}/`,
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      console.error('Sign up error:', error);
      throw new Error(error.message);
    }

    // Bootstrap user profile and roles
    if (data.user) {
      try {
        const { error: bootstrapError } = await supabase.rpc('ensure_user_bootstrap', {
          _user_id: data.user.id
        });
        
        if (bootstrapError) {
          console.error('Bootstrap error:', bootstrapError);
        }
      } catch (err) {
        console.error('Failed to bootstrap user:', err);
      }
    }

    return { user: data.user, session: data.session };
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      throw new Error(error.message);
    }

    return { user: data.user, session: data.session };
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive',
      });
      throw new Error(error.message);
    }
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }

    // Get user roles
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id);

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', session.user.id)
      .single();

    return {
      id: session.user.id,
      email: session.user.email!,
      displayName: profile?.display_name,
      roles: roles?.map(r => r.role) || [],
    };
  }

  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${env.VITE_APP_BASE_URL}/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);
      throw new Error(error.message);
    }
  }
}
