import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSkeleton } from '../LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders loading skeleton elements', () => {
    render(<LoadingSkeleton />);
    
    // Check for skeleton elements (they should have skeleton class)
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays multiple skeleton items', () => {
    render(<LoadingSkeleton />);
    
    // Check that multiple skeleton elements are rendered
    const skeletons = document.querySelectorAll('[data-testid*="skeleton"], .h-8, .h-4, .h-32, .h-64');
    expect(skeletons.length).toBeGreaterThan(4);
  });
});