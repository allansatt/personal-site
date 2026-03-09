import { useEffect } from 'react';
import type { Job } from './useJobList';

export function useJobPoller(jobs: Job[], refresh: () => void): void {
  useEffect(() => {
    const hasPending = jobs.some((j) => j.status === 'pending');
    if (!hasPending) return;

    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [jobs, refresh]);
}
