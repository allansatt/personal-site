import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useJobList } from './useJobList';

vi.mock('react-oidc-context', () => ({
  useAuth: () => ({
    user: { id_token: 'test-token' },
  }),
}));

const MOCK_JOBS = [
  { jobId: 'job-1', displayName: 'file1.txt', status: 'completed', createdAt: '2026-03-01T00:00:00Z' },
  { jobId: 'job-2', displayName: 'file2.txt', status: 'pending', createdAt: '2026-03-02T00:00:00Z' },
];

describe('useJobList', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches jobs from GET /files with Bearer token on mount', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ jobs: MOCK_JOBS, nextToken: null }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useJobList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://hand-history.allansattelbergrivera.com/files',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
    expect(result.current.jobs).toEqual(MOCK_JOBS);
    expect(result.current.nextToken).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('appends limit and nextToken as query params when provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ jobs: [], nextToken: null }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useJobList({ limit: 5, nextToken: 'abc123' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://hand-history.allansattelbergrivera.com/files?limit=5&nextToken=abc123',
      expect.anything(),
    );
  });

  it('omits query params when not provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ jobs: [], nextToken: null }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useJobList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://hand-history.allansattelbergrivera.com/files',
      expect.anything(),
    );
  });

  it('sets error.message to "Unauthorized" on 401 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      }),
    );

    const { result } = renderHook(() => useJobList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Unauthorized');
    expect(result.current.jobs).toEqual([]);
  });

  it('sets a generic error on 500 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    const { result } = renderHook(() => useJobList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).not.toContain('test-token');
    expect(result.current.jobs).toEqual([]);
  });

  it('refresh() re-triggers the fetch', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ jobs: MOCK_JOBS, nextToken: null }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useJobList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
