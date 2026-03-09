import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PokerHandsPage from './PokerHandsPage';

const mockSigninRedirect = vi.fn();

let mockAuth: { isLoading: boolean; isAuthenticated: boolean; signinRedirect: () => void };

vi.mock('react-oidc-context', () => ({
  useAuth: () => mockAuth,
}));

vi.mock('./UploadForm', () => ({
  default: ({ onUploadSuccess }: { onUploadSuccess: () => void }) => (
    <div data-testid="upload-form">
      <button onClick={onUploadSuccess}>mock-upload-success</button>
    </div>
  ),
}));

let jobListKey: number | undefined;
vi.mock('./JobList', () => ({
  default: ({ refreshKey }: { refreshKey?: number }) => {
    jobListKey = refreshKey;
    return <div data-testid="job-list">JobList key={refreshKey}</div>;
  },
}));

describe('PokerHandsPage', () => {
  beforeEach(() => {
    mockAuth = {
      isLoading: false,
      isAuthenticated: false,
      signinRedirect: mockSigninRedirect,
    };
    mockSigninRedirect.mockReset();
    jobListKey = undefined;
  });

  afterEach(cleanup);

  it('shows loading indicator while auth is loading', () => {
    mockAuth.isLoading = true;
    render(<PokerHandsPage />);
    expect(screen.getByText(/loading/i)).toBeTruthy();
    expect(screen.queryByTestId('upload-form')).toBeNull();
    expect(screen.queryByTestId('job-list')).toBeNull();
  });

  it('shows sign-in prompt when not authenticated', () => {
    mockAuth.isAuthenticated = false;
    render(<PokerHandsPage />);
    expect(screen.getByText(/please sign in/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
    expect(screen.queryByTestId('upload-form')).toBeNull();
    expect(screen.queryByTestId('job-list')).toBeNull();
  });

  it('sign-in button calls signinRedirect', () => {
    mockAuth.isAuthenticated = false;
    render(<PokerHandsPage />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(mockSigninRedirect).toHaveBeenCalled();
  });

  it('renders UploadForm and JobList when authenticated', () => {
    mockAuth.isAuthenticated = true;
    render(<PokerHandsPage />);
    expect(screen.getByTestId('upload-form')).toBeTruthy();
    expect(screen.getByTestId('job-list')).toBeTruthy();
  });

  it('increments refreshKey when onUploadSuccess is called', () => {
    mockAuth.isAuthenticated = true;
    render(<PokerHandsPage />);
    const initialKey = jobListKey;
    fireEvent.click(screen.getByText('mock-upload-success'));
    expect(jobListKey).toBe((initialKey ?? 0) + 1);
  });
});
