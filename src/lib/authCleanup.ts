/**
 * Authentication cleanup utility to prevent limbo states
 * Clears all auth-related localStorage and sessionStorage entries
 */

export const cleanupAuthState = () => {
  // Remove standard Supabase auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
  
  console.log('Auth state cleaned up');
};

export const performCleanSignIn = async (signInFn: () => Promise<void>) => {
  // Clean up existing state
  cleanupAuthState();
  
  // Attempt global sign out to ensure clean state
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.auth.signOut({ scope: 'global' });
  } catch (err) {
    // Continue even if this fails
    console.warn('Global sign out failed during clean sign in:', err);
  }
  
  // Perform the sign in
  await signInFn();
};

export const performCleanSignOut = async () => {
  try {
    // Clean up auth state first
    cleanupAuthState();
    
    // Attempt global sign out
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.warn('Global sign out failed:', err);
    }
    
    // Force page reload for a completely clean state
    window.location.href = '/auth';
  } catch (error) {
    console.error('Error during sign out:', error);
    // Force redirect even on error
    window.location.href = '/auth';
  }
};