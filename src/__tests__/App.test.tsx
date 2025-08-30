import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import App from '../App'

// Mock the lazy-loaded components to avoid issues with dynamic imports in tests
vi.mock('../pages/Dashboard', () => ({
  default: () => <div>Dashboard Page</div>
}))

vi.mock('../pages/Clients', () => ({
  default: () => <div>Clients Page</div>
}))

vi.mock('../pages/Videos', () => ({
  default: () => <div>Videos Page</div>
}))

vi.mock('../pages/Ads', () => ({
  default: () => <div>Ads Page</div>
}))

vi.mock('../pages/EOS', () => ({
  default: () => <div>EOS Page</div>
}))

vi.mock('../pages/NotFound', () => ({
  default: () => <div>404 Not Found</div>
}))

describe('App', () => {
  it('renders without crashing', async () => {
    render(<App />)
    
    // Should render the layout
    await waitFor(() => {
      expect(screen.getByText('ONE OS')).toBeInTheDocument()
    })
  })

  it('renders dashboard page on root route', async () => {
    window.history.pushState({}, 'Test page', '/')
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    })
  })

  it('renders 404 page for unknown routes', async () => {
    window.history.pushState({}, 'Test page', '/unknown-route')
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('404 Not Found')).toBeInTheDocument()
    })
  })

  it('renders 404 page for /settings route (not implemented)', async () => {
    window.history.pushState({}, 'Test page', '/settings')
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('404 Not Found')).toBeInTheDocument()
    })
  })

  it('renders sidebar navigation', async () => {
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Clients')).toBeInTheDocument()
      expect(screen.getByText('Vidéos')).toBeInTheDocument()
      expect(screen.getByText('Publicités')).toBeInTheDocument()
      expect(screen.getByText('EOS')).toBeInTheDocument()
    })
  })

  it('renders global header', async () => {
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('ONE OS')).toBeInTheDocument()
      expect(screen.getByText('Operating System - Agence de Croissance')).toBeInTheDocument()
      expect(screen.getByText('Système Opérationnel')).toBeInTheDocument()
    })
  })
})