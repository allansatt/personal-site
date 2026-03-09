import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginBar from './LoginBar';

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

describe('LoginBar', () => {
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

  it('shows Poker Hands link when authenticated', () => {
    mockAuth.isAuthenticated = true;
    render(
      <MemoryRouter>
        <LoginBar />
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: /poker hands/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/pokerhands');
  });

  it('does not show Poker Hands link when unauthenticated', () => {
    mockAuth.isAuthenticated = false;
    render(
      <MemoryRouter>
        <LoginBar />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('link', { name: /poker hands/i })).toBeNull();
  });

  it('still shows Sign out button when authenticated', () => {
    mockAuth.isAuthenticated = true;
    render(
      <MemoryRouter>
        <LoginBar />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /sign out/i })).toBeTruthy();
  });

  it('still shows Sign in button when unauthenticated', () => {
    mockAuth.isAuthenticated = false;
    render(
      <MemoryRouter>
        <LoginBar />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
  });
});
