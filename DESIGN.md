# ONE OS Design System

## Overview
A modern, accessible design system built for rapid development with Tailwind CSS and shadcn/ui components.

## Design Tokens

### Colors (HSL Format)
```css
/* Primary Brand */
--primary: 221 83% 53%
--primary-foreground: 0 0% 98%

/* Status Colors */
--success: 142 76% 36%
--warning: 38 92% 50%
--info: 199 89% 48%
--destructive: 0 62.8% 30.6%

/* Neutral Scale */
--background: 240 10% 3.9%
--foreground: 0 0% 98%
--muted: 240 3.7% 15.9%
--muted-foreground: 240 5% 64.9%
```

### Gradients
```css
--gradient-primary: linear-gradient(135deg, hsl(221 83% 53%), hsl(221 83% 63%))
--gradient-success: linear-gradient(135deg, hsl(142 76% 36%), hsl(142 76% 46%))
--gradient-warning: linear-gradient(135deg, hsl(38 92% 50%), hsl(38 92% 60%))
```

### Typography Scale
- **Display**: 36px/40px - Hero headlines
- **H1**: 30px/36px - Page titles
- **H2**: 24px/32px - Section headers
- **H3**: 20px/28px - Card titles
- **Body**: 16px/24px - Default text
- **Small**: 14px/20px - Secondary text
- **Tiny**: 12px/16px - Captions

### Spacing System (4/8px Grid)
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

## Components

### StatCard
Reusable metric card with consistent styling and tone variants.
```tsx
<StatCard
  title="Clients Actifs"
  value="12"
  tone="success"
  change="+2 ce mois"
  icon={Users}
/>
```

**Props:**
- `title`: Card title
- `value`: Main display value
- `tone`: "success" | "warning" | "info" | "destructive" | "primary"
- `progress?`: Optional progress percentage
- `change?`: Change indicator text
- `icon?`: Lucide icon component
- `alert?`: Alert message

### PageHeader
Consistent page header with title, subtitle, and actions.
```tsx
<PageHeader
  title="Dashboard"
  subtitle="Vue d'ensemble de votre agence"
  actions={<Button>Action</Button>}
  gradient={true}
/>
```

### EmptyState
Standardized empty state component.
```tsx
<EmptyState
  icon={Users}
  title="Aucun client"
  description="Commencez par ajouter votre premier client"
  action={{ label: "Ajouter Client", onClick: () => {} }}
/>
```

### Section
Wrapper for consistent spacing and animations.
```tsx
<Section>
  <PageHeader />
  {/* Content */}
</Section>
```

### ScreenshotFrame
TikTok-ready 9:16 aspect ratio container.
```tsx
<ScreenshotFrame ratio={9/16}>
  {/* Shareable content */}
</ScreenshotFrame>
```

## Animations

### Available Animations
- `animate-fade-in`: Smooth entrance
- `animate-scale-in`: Scale entrance
- `animate-slide-in-right`: Slide from right
- `hover-scale`: Hover scale effect

### Usage
```tsx
<div className="motion-safe:animate-fade-in hover-scale">
  {/* Content */}
</div>
```

## Interaction Patterns

### Hover States
- Cards: Subtle scale (hover-scale)
- Buttons: Built-in variants
- Links: Underline animation (story-link)

### Focus States
- Visible focus rings on all interactive elements
- High contrast focus indicators
- Keyboard navigation support

### Motion Preferences
- All animations wrapped in `motion-safe:`
- Respects `prefers-reduced-motion`
- Fallback to instant state changes

## Mobile Guidelines

### Mobile FAB
Fixed bottom-right floating action button for primary actions on mobile.
```tsx
<Button className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full">
  📊
</Button>
```

### Responsive Patterns
- Mobile-first approach
- Touch-friendly targets (44px minimum)
- Thumb-reach optimization
- Collapsible navigation

## Accessibility

### ARIA Labels
- All interactive elements have accessible names
- Status updates use `aria-live="polite"`
- Role attributes for custom components

### Color Contrast
- WCAG AA compliant color combinations
- Semantic color usage
- Dark/light mode support

### Keyboard Navigation
- Tab order follows visual hierarchy
- Focus indicators always visible
- Escape key closes modals/dropdowns

## Performance

### Code Splitting
- Lazy-loaded route components
- Skeleton screens during loading
- Optimized bundle sizes

### Image Optimization
- Lazy loading for images
- Proper alt attributes
- Responsive image sizing

## Screenshot Mode

### Social Media Ready
- 9:16 aspect ratio support
- Screenshot-optimized layouts
- Share-worthy visual moments
- Hide navigation when screenshotting

### Usage
```tsx
<ScreenshotFrame screenshotMode={true}>
  {/* Content optimized for sharing */}
</ScreenshotFrame>
```

## Best Practices

### Do's
✅ Use semantic tokens instead of direct colors
✅ Follow 4/8px spacing grid
✅ Include hover/focus states
✅ Test with screen readers
✅ Optimize for mobile-first
✅ Use motion-safe for animations

### Don'ts
❌ Use dynamic Tailwind class concatenation
❌ Forget accessibility attributes
❌ Ignore reduced-motion preferences
❌ Create custom form inputs unnecessarily
❌ Use too many fonts or colors
❌ Over-engineer simple interactions

## Development Workflow

1. **Design with tokens**: Use CSS variables, not direct values
2. **Component-first**: Build reusable patterns
3. **Mobile-first**: Start with mobile layout
4. **Test accessibility**: Use keyboard and screen reader
5. **Optimize performance**: Lazy load and code split
6. **Document usage**: Add props and examples