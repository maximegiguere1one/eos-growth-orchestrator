
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from './observability';

export type AuthSession = Session | null;
export type AuthUser = User | null;

export class AuthService {
  private supabase = supabase;
  private session: AuthSession = null;

  constructor() {
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.session = session;
    });

    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session);
      this.session = session;
    });
  }

  getSession(): AuthSession {
    return this.session;
  }

  // Email+OTP sign-in (kept for magic link flows)
  async signInWithEmail(email: string, redirectTo?: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo || window.location.origin,
        },
      });

      if (error) {
        logger.error('Sign-in with email error', { error });
        throw error;
      }
    } catch (error: any) {
      logger.error('Sign-in with email failed', { error });
      throw new Error(error.message || 'Sign-in failed');
    }
  }

  // Email+password sign-in (used by AuthProvider/AuthForm)
  async signIn(email: string, password: string): Promise<void> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      logger.error('Sign-in failed', { error });
      throw new Error(error.message || 'Sign-in failed');
    }
  }

  // Email+password sign-up
  async signUp(email: string, password: string, displayName?: string): Promise<void> {
    const { error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: displayName ? { display_name: displayName } : undefined,
        emailRedirectTo: window.location.origin, // adjust if you have a specific verification route
      },
    });
    if (error) {
      logger.error('Sign-up failed', { error });
      throw new Error(error.message || 'Sign-up failed');
    }
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin, // adjust to your reset page if needed
    });
    if (error) {
      logger.error('Reset password failed', { error });
      throw new Error(error.message || 'Reset password failed');
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      logger.error('Sign out error', { error });
      throw error;
    }
    
    // Clear local storage and redirect
    localStorage.clear();
    window.location.href = '/auth';
  }

  async refreshSession(): Promise<AuthSession> {
    const { data, error } = await this.supabase.auth.refreshSession()

    if (error) {
      logger.error('Session refresh failed', { error });
      throw new Error(error.message || 'Session refresh failed');
    }

    this.session = data.session;
    return this.session;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await this.supabase.auth.getUser();
    if (error) {
      logger.error('Get current user failed', { error });
      return null;
    }
    return data.user ?? null;
  }

  getUser() {
    return this.session?.user ?? null;
  }
}

export const authService = new AuthService();

