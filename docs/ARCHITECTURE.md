
# Architecture Documentation

## System Architecture

```mermaid
graph TB
    Client[React Client]
    CDN[Vercel/Netlify CDN]
    Auth[Supabase Auth]
    DB[(PostgreSQL)]
    RT[Realtime Engine]
    Storage[Supabase Storage]
    Analytics[PostHog]
    Errors[Sentry]
    
    Client --> CDN
    Client --> Auth
    Client --> DB
    Client --> RT
    Client --> Storage
    Client --> Analytics
    Client --> Errors
    
    Auth --> DB
    RT --> DB
    
    subgraph "Supabase Backend"
        Auth
        DB
        RT
        Storage
    end
    
    subgraph "Observability"
        Analytics
        Errors
    end
```

## Entity Relationship Diagram

```mermaid
erDiagram
    profiles {
        uuid id PK
        text email
        text display_name
        timestamptz created_at
        timestamptz updated_at
    }
    
    user_roles {
        uuid id PK
        uuid user_id FK
        app_role role
        timestamptz created_at
    }
    
    eos_issues {
        uuid id PK
        uuid created_by FK
        uuid assigned_to FK
        text title
        text description
        issue_status status
        int priority
        timestamptz resolved_at
        timestamptz archived_at
        timestamptz created_at
        timestamptz updated_at
    }
    
    eos_rocks {
        uuid id PK
        uuid created_by FK
        uuid owner_id FK
        text title
        text description
        rock_status status
        numeric progress
        date start_date
        date due_date
        timestamptz completed_at
        timestamptz archived_at
        timestamptz created_at
        timestamptz updated_at
    }
    
    eos_kpis {
        uuid id PK
        uuid created_by FK
        text name
        text unit
        text direction
        numeric target
        int position
        bool is_active
        timestamptz archived_at
        timestamptz created_at
        timestamptz updated_at
    }
    
    eos_kpi_values {
        uuid id PK
        uuid kpi_id FK
        uuid created_by FK
        date week_start_date
        numeric value
        timestamptz created_at
        timestamptz updated_at
    }
    
    eos_todos {
        uuid id PK
        uuid created_by FK
        uuid assigned_to FK
        text description
        date due_date
        timestamptz completed_at
        timestamptz archived_at
        timestamptz created_at
        timestamptz updated_at
    }
    
    eos_meetings {
        uuid id PK
        uuid created_by FK
        meeting_status status
        timestamptz started_at
        timestamptz ended_at
        jsonb agenda
        timestamptz archived_at
        timestamptz created_at
        timestamptz updated_at
    }
    
    eos_meeting_notes {
        uuid id PK
        uuid meeting_id FK
        uuid created_by FK
        text item_type
        text note
        timestamptz created_at
        timestamptz updated_at
    }
    
    audit_logs {
        uuid id PK
        uuid actor_id FK
        text table_name
        uuid row_id
        audit_action action
        jsonb details
        timestamptz created_at
    }
    
    profiles ||--o{ user_roles : has
    profiles ||--o{ eos_issues : creates
    profiles ||--o{ eos_issues : assigned_to
    profiles ||--o{ eos_rocks : creates
    profiles ||--o{ eos_rocks : owns
    profiles ||--o{ eos_kpis : creates
    profiles ||--o{ eos_kpi_values : creates
    profiles ||--o{ eos_todos : creates
    profiles ||--o{ eos_todos : assigned_to
    profiles ||--o{ eos_meetings : creates
    profiles ||--o{ eos_meeting_notes : creates
    profiles ||--o{ audit_logs : actor
    
    eos_kpis ||--o{ eos_kpi_values : has_values
    eos_meetings ||--o{ eos_meeting_notes : has_notes
```

## Component Architecture

### Frontend Layer
- **React 18** with concurrent features
- **TypeScript** strict mode for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with design system tokens
- **shadcn/ui** component library for consistency

### State Management
- **React Query** for server state and caching
- **Zustand** for minimal global client state
- **React Context** for authentication state
- **Local state** via useState/useReducer where appropriate

### Data Layer
- **Supabase Client** for database operations
- **Row Level Security** for authorization
- **Real-time subscriptions** for live updates
- **Optimistic updates** for better UX

### Security Architecture
- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Row Level Security policies
- **Input Validation**: Zod schemas on client and server
- **CSP Headers**: Content Security Policy implementation
- **HTTPS**: Enforced in production

### Performance Architecture
- **Code Splitting**: Route-based lazy loading
- **Bundle Optimization**: Tree shaking and minification
- **Caching Strategy**: React Query with stale-while-revalidate
- **Image Optimization**: Responsive images with WebP
- **CDN**: Static assets served from edge locations

### Observability Architecture
- **Error Tracking**: Sentry with source maps and releases
- **Analytics**: PostHog for product insights and funnels
- **Logging**: Structured logs with correlation IDs
- **Monitoring**: Core Web Vitals and performance metrics
- **Tracing**: OpenTelemetry for distributed tracing
