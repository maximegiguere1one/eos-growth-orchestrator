
// Content Security Policy Configuration
export const cspConfig = {
  // Default source for all content types
  'default-src': ["'self'"],
  
  // Script sources - including PostHog and Sentry
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vite in development
    'https://app.posthog.com',
    'https://browser.sentry.io',
  ],
  
  // Style sources - allow inline styles for CSS-in-JS
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com',
  ],
  
  // Image sources - allow data URLs and HTTPS
  'img-src': [
    "'self'",
    'data:',
    'https:',
    'blob:',
  ],
  
  // Connection sources - API endpoints
  'connect-src': [
    "'self'",
    'https://xflfbousrubboovxhmwi.supabase.co',
    'https://app.posthog.com',
    'https://o4507891253551104.ingest.us.sentry.io',
    'wss://xflfbousrubboovxhmwi.supabase.co', // WebSocket for realtime
  ],
  
  // Font sources
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:',
  ],
  
  // Media sources
  'media-src': ["'self'"],
  
  // Object sources - disallow plugins
  'object-src': ["'none'"],
  
  // Frame sources - prevent clickjacking
  'frame-src': ["'none'"],
  
  // Frame ancestors - prevent embedding
  'frame-ancestors': ["'none'"],
  
  // Base URI - restrict base tag
  'base-uri': ["'self'"],
  
  // Form action - restrict form submissions
  'form-action': ["'self'"],
  
  // Upgrade insecure requests in production
  'upgrade-insecure-requests': [],
};

// Convert CSP object to header string
export function generateCSPHeader(config = cspConfig): string {
  const directives = Object.entries(config)
    .map(([directive, sources]) => {
      if (Array.isArray(sources) && sources.length > 0) {
        return `${directive} ${sources.join(' ')}`;
      } else if (sources.length === 0) {
        return directive; // For directives like upgrade-insecure-requests
      }
      return null;
    })
    .filter(Boolean);
  
  return directives.join('; ');
}

// Security headers configuration
export const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': generateCSPHeader(),
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Frame options
  'X-Frame-Options': 'DENY',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  
  // HSTS (only in production over HTTPS)
  ...(typeof window !== 'undefined' && window.location.protocol === 'https:' && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  }),
};

// Helper to set CSP in development
export function setDevelopmentCSP() {
  if (import.meta.env.DEV) {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = generateCSPHeader({
      ...cspConfig,
      'script-src': [...cspConfig['script-src'], "'unsafe-eval'"], // Allow eval in dev
    });
    document.head.appendChild(meta);
  }
}
