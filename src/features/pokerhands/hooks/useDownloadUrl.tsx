import { useState, useCallback } from 'react';
import { useAuth } from 'react-oidc-context';
import { API_BASE_URL } from 'config';

interface DownloadUrlState {
  isLoading: boolean;
  error: Error | null;
  conflictError: boolean;
}

export function useDownloadUrl() {
  const auth = useAuth();
  const [state, setState] = useState<DownloadUrlState>({
    isLoading: false,
    error: null,
    conflictError: false,
  });

  const requestDownload = useCallback(
    async (jobId: string) => {
      setState({ isLoading: true, error: null, conflictError: false });
      try {
        const res = await fetch(`${API_BASE_URL}/download?jobId=${jobId}`, {
          headers: {
            Authorization: `Bearer ${auth.user?.id_token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('Unauthorized');
          }
          if (res.status === 409) {
            setState({
              isLoading: false,
              error: new Error('Job not yet completed'),
              conflictError: true,
            });
            return;
          }
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = (await res.json()) as { downloadUrl: string };

        const a = document.createElement('a');
        a.href = data.downloadUrl;
        a.setAttribute('download', '');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setState({ isLoading: false, error: null, conflictError: false });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        }));
      }
    },
    [auth.user?.id_token],
  );

  return { ...state, requestDownload };
}
