import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { AppSidebar } from '../AppSidebar'

describe('AppSidebar', () => {
  it('renders navigation menu with all links', () => {
    render(<AppSidebar />)
    
    expect(screen.getByText('Cockpit')).toBeInTheDocument()
    expect(screen.getByText('Clients')).toBeInTheDocument()
    expect(screen.getByText('Vidéos')).toBeInTheDocument()
    expect(screen.getByText('Publicités')).toBeInTheDocument()
    expect(screen.getByText('EOS Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Paramètres')).toBeInTheDocument()
  })

  it('renders navigation links with correct hrefs', () => {
    render(<AppSidebar />)
    
    expect(screen.getByRole('link', { name: /cockpit/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /clients/i })).toHaveAttribute('href', '/clients')
    expect(screen.getByRole('link', { name: /vidéos/i })).toHaveAttribute('href', '/videos')
    expect(screen.getByRole('link', { name: /publicités/i })).toHaveAttribute('href', '/ads')
    expect(screen.getByRole('link', { name: /eos dashboard/i })).toHaveAttribute('href', '/eos')
    expect(screen.getByRole('link', { name: /paramètres/i })).toHaveAttribute('href', '/settings')
  })

  it('renders section labels', () => {
    render(<AppSidebar />)
    
    expect(screen.getByText('Navigation')).toBeInTheDocument()
    expect(screen.getByText('EOS Model')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<AppSidebar />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    
    // All navigation links should be accessible
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
    
    links.forEach(link => {
      expect(link).toHaveAttribute('href')
    })
  })
})