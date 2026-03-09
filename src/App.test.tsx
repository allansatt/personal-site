import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

let mockAuth: {
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  signinRedirect: () => void;
  removeUser: () => Promise<void>;
};

vi.mock('react-oidc-context', () => ({
  useAuth: () => mockAuth,
}));

// Isolate: render only the Routes, not App's own BrowserRouter
// We need to mock BrowserRouter to avoid nesting routers
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('App /pokerhands route', () => {
  beforeEach(() => {
    mockAuth = {
      isLoading: false,
      isAuthenticated: false,
      error: null,
      signinRedirect: vi.fn(),
      removeUser: vi.fn().mockResolvedValue(undefined),
    };
  });

  afterEach(cleanup);

  it('renders PokerHandsPage sign-in prompt at /pokerhands when unauthenticated', () => {
    render(
      <MemoryRouter initialEntries={['/pokerhands']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/please sign in to use poker hands/i)).toBeTruthy();
  });

  it('renders PokerHandsPage content at /pokerhands when authenticated', () => {
    mockAuth.isAuthenticated = true;
    render(
      <MemoryRouter initialEntries={['/pokerhands']}>
        <App />
      </MemoryRouter>,
    );
    // UploadForm renders a file input
    expect(screen.getByText(/poker hands/i)).toBeTruthy();
    // Should NOT show the old placeholder
    expect(screen.queryByText('Poker Hands (coming soon)')).toBeNull();
  });

  it('does not render the placeholder text', () => {
    render(
      <MemoryRouter initialEntries={['/pokerhands']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.queryByText('Poker Hands (coming soon)')).toBeNull();
  });
});
