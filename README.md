
# EOS Management System

A production-ready EOS (Entrepreneurial Operating System) management application built with React 18, TypeScript, and Supabase.

## 🚀 Quick Start

```bash
# Clone and install
git clone <repo-url>
cd eos-management
npm install

# Environment setup
cp .env.example .env.local
# Fill in your environment variables (see table below)

# Start development
npm run dev

# Run tests
npm test
npm run test:e2e

# Build for production
npm run build
```

## 📋 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL (e.g., `https://xyz.supabase.co` or `http://localhost:54321` for local dev) | ✅ | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (public anon key for the project) | ✅ | `eyJhbGciOiJIUzI1NiIs...` |
| `VITE_POSTHOG_KEY` | PostHog API key | ✅ | `phc_xxx` |
| `VITE_POSTHOG_HOST` | PostHog host | ✅ | `https://app.posthog.com` |
| `VITE_SENTRY_DSN` | Sentry DSN for error tracking | ✅ | `https://xxx@sentry.io/xxx` |
| `VITE_APP_ENV` | Environment (dev/staging/prod) | ✅ | `production` |

## 🏗️ Architecture

This application follows a modern React architecture with:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **State Management**: React Query + Zustand (minimal)
- **Testing**: Vitest + Testing Library + Playwright
- **Observability**: Sentry + PostHog + OpenTelemetry
- **CI/CD**: GitHub Actions with staging/production deployments

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage report
npm run test:e2e     # Run end-to-end tests
npm run lint         # Lint code
npm run format       # Format code with Prettier
npm run typecheck    # Run TypeScript checks
npm run db:seed      # Seed database with demo data
```

## 📁 Project Structure

```
├── docs/                    # Documentation
├── e2e/                     # E2E tests (Playwright)
├── infrastructure/          # Infrastructure configs
├── public/                  # Static assets
├── src/
│   ├── analytics/          # PostHog integration
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── common/        # Shared components
│   │   ├── eos/           # EOS-specific components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # UI library (shadcn/ui)
│   ├── contexts/          # React contexts
│   ├── features/          # Feature-based modules
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities and configurations
│   ├── locales/           # i18n translations
│   ├── pages/             # Route components
│   ├── store/             # Zustand stores
│   └── types/             # TypeScript type definitions
└── supabase/              # Supabase migrations and config
```

## 🌍 Internationalization

The app supports English and French (Canadian):
- Default: French (Canadian) - `fr-CA`
- Fallback: English - `en`

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Input validation with Zod schemas
- OWASP security headers implemented
- Secrets managed through environment variables
- Authentication via Supabase Auth

## 📊 Monitoring & Analytics

- **Error Tracking**: Sentry with source maps
- **Product Analytics**: PostHog with custom events
- **Performance**: Core Web Vitals monitoring
- **Logs**: Structured logging with OpenTelemetry

## 🚢 Deployment

The application is configured for deployment on:
- **Frontend**: Vercel/Netlify
- **Backend**: Supabase
- **CI/CD**: GitHub Actions

See `docs/DEPLOYMENT.md` for detailed deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test && npm run test:e2e`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
