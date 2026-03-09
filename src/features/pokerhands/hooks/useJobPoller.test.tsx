import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useJobPoller } from './useJobPoller';
import type { Job } from './useJobList';

describe('useJobPoller', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts polling when any job has pending status', () => {
    const refresh = vi.fn();
    const jobs: Job[] = [
      { jobId: 'job-1', displayName: 'file1.txt', status: 'completed', createdAt: '2026-03-01T00:00:00Z' },
      { jobId: 'job-2', displayName: 'file2.txt', status: 'pending', createdAt: '2026-03-02T00:00:00Z' },
    ];

    renderHook(() => useJobPoller(jobs, refresh));

    expect(refresh).not.toHaveBeenCalled();

    vi.advanceTimersByTime(3000);
    expect(refresh).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(3000);
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it('does not start polling when no jobs are pending', () => {
    const refresh = vi.fn();
    const jobs: Job[] = [
      { jobId: 'job-1', displayName: 'file1.txt', status: 'completed', createdAt: '2026-03-01T00:00:00Z' },
    ];

    renderHook(() => useJobPoller(jobs, refresh));

    vi.advanceTimersByTime(9000);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('clears interval when all jobs leave pending status', () => {
    const refresh = vi.fn();
    const pendingJobs: Job[] = [
      { jobId: 'job-1', displayName: 'file1.txt', status: 'pending', createdAt: '2026-03-01T00:00:00Z' },
    ];
    const completedJobs: Job[] = [
      { jobId: 'job-1', displayName: 'file1.txt', status: 'completed', createdAt: '2026-03-01T00:00:00Z' },
    ];

    const { rerender } = renderHook(
      ({ jobs }) => useJobPoller(jobs, refresh),
      { initialProps: { jobs: pendingJobs } },
    );

    vi.advanceTimersByTime(3000);
    expect(refresh).toHaveBeenCalledTimes(1);

    rerender({ jobs: completedJobs });

    refresh.mockClear();
    vi.advanceTimersByTime(9000);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('clears interval on unmount', () => {
    const refresh = vi.fn();
    const jobs: Job[] = [
      { jobId: 'job-1', displayName: 'file1.txt', status: 'pending', createdAt: '2026-03-01T00:00:00Z' },
    ];

    const { unmount } = renderHook(() => useJobPoller(jobs, refresh));

    vi.advanceTimersByTime(3000);
    expect(refresh).toHaveBeenCalledTimes(1);

    unmount();

    refresh.mockClear();
    vi.advanceTimersByTime(9000);
    expect(refresh).not.toHaveBeenCalled();
  });
});
