# Development Guide

## Documentation Synchronization

This project maintains two key documentation artifacts that must stay synchronized:

### Knowledge Base (KNOWLEDGE_BASE.md)
- **Purpose**: Long-term memory and context
- **Update Triggers**: Technology changes, business goal shifts, new constraints
- **Review Frequency**: Monthly or when major decisions are made

### Project Requirements Document (PRD.md)  
- **Purpose**: Implementation blueprint and specifications
- **Update Triggers**: Feature changes, user story modifications, acceptance criteria updates
- **Review Frequency**: Weekly during active development

## Synchronization Checklist

When updating either document, verify:

- [ ] **Consistency**: Changes align between Knowledge Base and PRD
- [ ] **Traceability**: Features in PRD support objectives in Knowledge Base
- [ ] **Completeness**: All stakeholders' concerns are addressed
- [ ] **Clarity**: Updates are unambiguous and actionable

## Testing Strategy

### Component Testing
- Unit tests for all utility functions and hooks
- Component tests for UI interactions and state management
- Integration tests for data flows and user workflows

### Test Structure
```
src/
├── components/
│   ├── auth/
│   │   ├── __tests__/
│   │   │   ├── RoleGuard.test.tsx
│   │   │   └── ProtectedRoute.test.tsx
│   ├── common/
│   │   ├── __tests__/
│   │   │   └── LoadingSkeleton.test.tsx
└── hooks/
    ├── __tests__/
    │   └── useRoles.test.ts
```

### Testing Guidelines
- Test user-facing behavior, not implementation details
- Mock external dependencies (Supabase, APIs)
- Use descriptive test names that explain the expected behavior
- Maintain test coverage above 80% for critical paths

## Architecture Patterns

### State Management
- **Server State**: React Query for data fetching and caching
- **Client State**: React Context for authentication and global UI state
- **Component State**: useState for local component state

### Component Organization
- **Pages**: Route-level components in `/pages`
- **Features**: Domain-specific components in `/features`
- **Common**: Reusable components in `/components/common`
- **UI**: Design system components in `/components/ui`

### Security Implementation
- Row-Level Security (RLS) policies for data access
- Role-based access control with RoleGuard component
- JWT token management with automatic refresh
- Audit logging for sensitive operations

## Performance Optimization

### Frontend Performance
- Memoization with React.memo for expensive renders
- Code splitting at route level
- Optimistic updates for better UX
- Image optimization and lazy loading

### Database Performance
- Indexed queries for frequently accessed data
- Efficient pagination for large datasets
- Connection pooling and query optimization
- Real-time subscriptions only where necessary

## Deployment Process

### Pre-deployment Checklist
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Security policies are verified
- [ ] Performance benchmarks met
- [ ] User acceptance testing completed

### Post-deployment Monitoring
- Application performance metrics
- Error rates and crash reports
- User engagement analytics
- System resource utilization

## Contributing Guidelines

### Code Style
- Follow TypeScript strict mode
- Use Prettier for code formatting
- Implement ESLint rules consistently
- Write self-documenting code with clear variable names

### Commit Convention
```
type(scope): description

Examples:
feat(auth): add role-based access control
fix(dashboard): resolve loading state issue
docs(prd): update user story acceptance criteria
```

### Pull Request Process
1. Create feature branch from main
2. Implement changes with tests
3. Update relevant documentation
4. Submit PR with clear description
5. Address review feedback
6. Merge after approval