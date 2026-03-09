import { useState, useEffect, useCallback } from 'react';
import { useAuth } from 'react-oidc-context';
import { API_BASE_URL } from 'config';

export interface Job {
  jobId: string;
  displayName: string;
  status: string;
  createdAt: string;
}

interface JobListState {
  jobs: Job[];
  nextToken: string | null;
  isLoading: boolean;
  error: Error | null;
}

export function useJobList(params?: { limit?: number; nextToken?: string }) {
  const auth = useAuth();
  const [state, setState] = useState<JobListState>({
    jobs: [],
    nextToken: null,
    isLoading: true,
    error: null,
  });
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchJobs = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit != null) queryParams.set('limit', String(params.limit));
      if (params?.nextToken != null) queryParams.set('nextToken', params.nextToken);
      const qs = queryParams.toString();
      const url = `${API_BASE_URL}/files${qs ? `?${qs}` : ''}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${auth.user?.id_token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = (await res.json()) as {
        items?: Job[];
        jobs?: Job[];
        nextToken?: string | null;
      };
      const jobs = data.jobs ?? data.items ?? [];
      setState({
        jobs,
        nextToken: data.nextToken ?? null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState({
        jobs: [],
        nextToken: null,
        isLoading: false,
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, [auth.user?.id_token, params?.limit, params?.nextToken]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, refreshCount]);

  const refresh = useCallback(() => {
    setRefreshCount((c) => c + 1);
  }, []);

  return { ...state, refresh };
}
