import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import JobList from './JobList';
import type { Job } from '../hooks/useJobList';

const mockRefresh = vi.fn();
let mockJobs: Job[] = [];
let mockNextToken: string | null = null;
let mockIsLoading = false;
let mockError: Error | null = null;

vi.mock('../hooks/useJobList', () => ({
  useJobList: () => ({
    jobs: mockJobs,
    nextToken: mockNextToken,
    isLoading: mockIsLoading,
    error: mockError,
    refresh: mockRefresh,
  }),
}));

const mockRequestDownload = vi.fn();
let mockDownloadConflictError = false;
let mockDownloadError: Error | null = null;

vi.mock('../hooks/useDownloadUrl', () => ({
  useDownloadUrl: () => ({
    isLoading: false,
    error: mockDownloadError,
    conflictError: mockDownloadConflictError,
    requestDownload: mockRequestDownload,
  }),
}));

const mockUseJobPoller = vi.fn();

vi.mock('../hooks/useJobPoller', () => ({
  useJobPoller: (...args: unknown[]) => mockUseJobPoller(...args),
}));

vi.mock('./JobStatusBadge', () => ({
  default: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

describe('JobList', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockJobs = [];
    mockNextToken = null;
    mockIsLoading = false;
    mockError = null;
    mockDownloadConflictError = false;
    mockDownloadError = null;
    mockRefresh.mockReset();
    mockRequestDownload.mockReset();
    mockUseJobPoller.mockReset();
  });

  afterEach(cleanup);

  it('renders job rows with display name, status badge, and created date', () => {
    mockJobs = [
      { jobId: 'j1', displayName: 'session1.txt', status: 'completed', createdAt: '2026-03-01T10:00:00Z' },
      { jobId: 'j2', displayName: 'session2.txt', status: 'pending', createdAt: '2026-03-02T12:00:00Z' },
    ];

    render(<JobList />);

    expect(screen.getByText('session1.txt')).toBeTruthy();
    expect(screen.getByText('session2.txt')).toBeTruthy();
    const badges = screen.getAllByTestId('status-badge');
    expect(badges).toHaveLength(2);
    expect(badges[0].textContent).toBe('completed');
    expect(badges[1].textContent).toBe('pending');
  });

  it('shows download button only for completed jobs', () => {
    mockJobs = [
      { jobId: 'j1', displayName: 'done.txt', status: 'completed', createdAt: '2026-03-01T10:00:00Z' },
      { jobId: 'j2', displayName: 'waiting.txt', status: 'pending', createdAt: '2026-03-02T12:00:00Z' },
      { jobId: 'j3', displayName: 'other.txt', status: 'failed', createdAt: '2026-03-03T12:00:00Z' },
    ];

    render(<JobList />);

    const downloadButtons = screen.getAllByRole('button', { name: /download/i });
    expect(downloadButtons).toHaveLength(1);
  });

  it('calls requestDownload when download button is clicked', async () => {
    mockJobs = [
      { jobId: 'j1', displayName: 'done.txt', status: 'completed', createdAt: '2026-03-01T10:00:00Z' },
    ];

    render(<JobList />);

    fireEvent.click(screen.getByRole('button', { name: /download/i }));

    await waitFor(() => {
      expect(mockRequestDownload).toHaveBeenCalledWith('j1');
    });
  });

  it('shows load-more button when nextToken is present', () => {
    mockJobs = [
      { jobId: 'j1', displayName: 'done.txt', status: 'completed', createdAt: '2026-03-01T10:00:00Z' },
    ];
    mockNextToken = 'abc123';

    render(<JobList />);

    expect(screen.getByRole('button', { name: /load more/i })).toBeTruthy();
  });

  it('does not show load-more button when nextToken is null', () => {
    mockJobs = [
      { jobId: 'j1', displayName: 'done.txt', status: 'completed', createdAt: '2026-03-01T10:00:00Z' },
    ];
    mockNextToken = null;

    render(<JobList />);

    expect(screen.queryByRole('button', { name: /load more/i })).toBeNull();
  });

  it('passes jobs and refresh to useJobPoller', () => {
    mockJobs = [
      { jobId: 'j1', displayName: 'waiting.txt', status: 'pending', createdAt: '2026-03-01T10:00:00Z' },
    ];

    render(<JobList />);

    expect(mockUseJobPoller).toHaveBeenCalledWith(mockJobs, mockRefresh);
  });

  it('shows sign-in prompt on 401 error', () => {
    mockError = new Error('Unauthorized');

    render(<JobList />);

    expect(screen.getByText(/sign in/i)).toBeTruthy();
  });

  it('shows generic error message on non-401 error', () => {
    mockError = new Error('Request failed with status 500');

    render(<JobList />);

    expect(screen.getByText(/error occurred/i)).toBeTruthy();
  });

  it('shows loading indicator while fetching', () => {
    mockIsLoading = true;

    render(<JobList />);

    expect(screen.getByText(/loading/i)).toBeTruthy();
  });

  it('shows conflict error message when download returns 409', () => {
    mockJobs = [
      { jobId: 'j1', displayName: 'done.txt', status: 'completed', createdAt: '2026-03-01T10:00:00Z' },
    ];
    mockDownloadConflictError = true;
    mockDownloadError = new Error('Job not yet completed');

    render(<JobList />);

    expect(screen.getByText(/not yet completed/i)).toBeTruthy();
  });
});
