import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUploadUrl } from './useUploadUrl';

vi.mock('react-oidc-context', () => ({
  useAuth: () => ({
    user: { id_token: 'test-token' },
  }),
}));

describe('useUploadUrl', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial idle state', () => {
    const { result } = renderHook(() => useUploadUrl());
    expect(result.current.uploadUrl).toBeNull();
    expect(result.current.jobId).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.requestUploadUrl).toBe('function');
  });

  it('POSTs to /upload-url with Bearer token and filename', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ uploadUrl: 'https://s3.example.com/upload', jobId: 'job-123' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useUploadUrl());
    await act(async () => {
      await result.current.requestUploadUrl('hands.txt');
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://hand-history.allansattelbergrivera.com/upload-url',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
        body: JSON.stringify({ filename: 'hands.txt' }),
      }),
    );
  });

  it('sets uploadUrl and jobId on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ uploadUrl: 'https://s3.example.com/upload', jobId: 'job-123' }),
      }),
    );

    const { result } = renderHook(() => useUploadUrl());
    await act(async () => {
      await result.current.requestUploadUrl('hands.txt');
    });

    expect(result.current.uploadUrl).toBe('https://s3.example.com/upload');
    expect(result.current.jobId).toBe('job-123');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error on non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    const { result } = renderHook(() => useUploadUrl());
    await act(async () => {
      await result.current.requestUploadUrl('hands.txt');
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.uploadUrl).toBeNull();
    expect(result.current.jobId).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
