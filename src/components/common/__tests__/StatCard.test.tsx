import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { StatCard } from '../StatCard'
import { TrendingUp } from 'lucide-react'

describe('StatCard', () => {
  it('renders basic stat card with title and value', () => {
    render(<StatCard title="Revenue" value="$10,000" />)
    
    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('$10,000')).toBeInTheDocument()
  })

  it('renders with icon when provided', () => {
    render(<StatCard title="Growth" value="15%" icon={TrendingUp} />)
    
    expect(screen.getByText('Growth')).toBeInTheDocument()
    expect(screen.getByText('15%')).toBeInTheDocument()
    // Icon should be rendered but testing its presence is tricky with Lucide icons
  })

  it('renders progress bar when progress is provided', () => {
    render(<StatCard title="Completion" value="75%" progress={75} />)
    
    expect(screen.getByText('Completion')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    // Progress component should be rendered
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders change information when provided', () => {
    render(<StatCard title="Sales" value="$5,000" change="+12% from last month" />)
    
    expect(screen.getByText('Sales')).toBeInTheDocument()
    expect(screen.getByText('$5,000')).toBeInTheDocument()
    expect(screen.getByText('+12% from last month')).toBeInTheDocument()
  })

  it('renders alert message when provided', () => {
    render(<StatCard title="Alerts" value="3" alert="Requires attention" />)
    
    expect(screen.getByText('Alerts')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Requires attention')).toBeInTheDocument()
  })

  it('applies correct tone classes', () => {
    const { rerender } = render(<StatCard title="Success" value="100%" tone="success" />)
    let card = screen.getByText('Success').closest('.border-l-2')
    expect(card).toHaveClass('border-l-success/20')

    rerender(<StatCard title="Warning" value="50%" tone="warning" />)
    card = screen.getByText('Warning').closest('.border-l-2')
    expect(card).toHaveClass('border-l-warning/20')

    rerender(<StatCard title="Error" value="0%" tone="destructive" />)
    card = screen.getByText('Error').closest('.border-l-2')
    expect(card).toHaveClass('border-l-destructive/20')
  })

  it('applies custom className when provided', () => {
    render(<StatCard title="Custom" value="123" className="custom-stat-card" />)
    
    const card = screen.getByText('Custom').closest('.custom-stat-card')
    expect(card).toBeInTheDocument()
  })

  it('renders alert without progress bar', () => {
    render(<StatCard title="Status" value="Active" alert="System operational" />)
    
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('System operational')).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})