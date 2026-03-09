import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDownloadUrl } from './useDownloadUrl';

vi.mock('react-oidc-context', () => ({
  useAuth: () => ({
    user: { id_token: 'test-token' },
  }),
}));

describe('useDownloadUrl', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial state with no loading and no errors', () => {
    const { result } = renderHook(() => useDownloadUrl());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.conflictError).toBe(false);
    expect(typeof result.current.requestDownload).toBe('function');
  });

  it('calls GET /download?jobId=<id> with Bearer token and triggers browser download on success', async () => {
    const presignedUrl =
      'https://s3.amazonaws.com/bucket/file.txt?presigned=abc';
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ downloadUrl: presignedUrl }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const clickSpy = vi.fn();
    const createdAnchors: HTMLAnchorElement[] = [];
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === 'a') {
        el.click = clickSpy;
        createdAnchors.push(el as HTMLAnchorElement);
      }
      return el;
    });
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

    const { result } = renderHook(() => useDownloadUrl());

    await act(async () => {
      await result.current.requestDownload('job-123');
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://hand-history.allansattelbergrivera.com/download?jobId=job-123',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );

    expect(createdAnchors).toHaveLength(1);
    expect(createdAnchors[0].href).toBe(presignedUrl);
    expect(createdAnchors[0].hasAttribute('download')).toBe(true);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.conflictError).toBe(false);
  });

  it('sets error.message to "Unauthorized" on 401 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      }),
    );

    const { result } = renderHook(() => useDownloadUrl());

    await act(async () => {
      await result.current.requestDownload('job-123');
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Unauthorized');
    expect(result.current.conflictError).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('sets conflictError to true with informative error on 409 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
      }),
    );

    const { result } = renderHook(() => useDownloadUrl());

    await act(async () => {
      await result.current.requestDownload('job-123');
    });

    expect(result.current.conflictError).toBe(true);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
  });

  it('sets a generic error on 500 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    const { result } = renderHook(() => useDownloadUrl());

    await act(async () => {
      await result.current.requestDownload('job-123');
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).not.toContain('test-token');
    expect(result.current.conflictError).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});
