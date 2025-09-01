import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from './observability';

export type AuthSession = Session | null;

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

  getUser() {
    return this.session?.user;
  }
}

export const authService = new AuthService();
