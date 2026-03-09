import { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { API_BASE_URL } from 'config';

interface UploadUrlState {
  uploadUrl: string | null;
  jobId: string | null;
  isLoading: boolean;
  error: Error | null;
}

export function useUploadUrl() {
  const auth = useAuth();
  const [state, setState] = useState<UploadUrlState>({
    uploadUrl: null,
    jobId: null,
    isLoading: false,
    error: null,
  });

  const requestUploadUrl = async (filename: string): Promise<{ uploadUrl: string; jobId: string } | null> => {
    setState({ uploadUrl: null, jobId: null, isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/upload-url`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.user?.id_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as { uploadUrl: string; jobId: string };
      setState({ uploadUrl: data.uploadUrl, jobId: data.jobId, isLoading: false, error: null });
      return data;
    } catch (err) {
      setState({
        uploadUrl: null,
        jobId: null,
        isLoading: false,
        error: err instanceof Error ? err : new Error(String(err)),
      });
      return null;
    }
  };

  return { ...state, requestUploadUrl };
}
