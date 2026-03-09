import { useState, useEffect } from 'react';
import { useJobList } from '../hooks/useJobList';
import type { Job } from '../hooks/useJobList';
import { useDownloadUrl } from '../hooks/useDownloadUrl';
import { useJobPoller } from '../hooks/useJobPoller';
import JobStatusBadge from './JobStatusBadge';

interface JobListProps {
  refreshKey?: number;
}

function JobList({ refreshKey }: JobListProps) {
  const [pageToken, setPageToken] = useState<string | undefined>(undefined);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const { jobs, nextToken, isLoading, error, refresh } = useJobList(
    pageToken ? { nextToken: pageToken } : undefined,
  );

  useEffect(() => {
    if (refreshKey !== undefined && refreshKey > 0) {
      setAllJobs([]);
      setPageToken(undefined);
      refresh();
    }
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const { conflictError, error: downloadError, requestDownload } = useDownloadUrl();

  useEffect(() => {
    if (jobs.length > 0) {
      setAllJobs((prev) => {
        const existingIds = new Set(prev.map((j) => j.jobId));
        const newJobs = jobs.filter((j) => !existingIds.has(j.jobId));
        return newJobs.length > 0 ? [...prev, ...newJobs] : prev;
      });
    }
  }, [jobs]);

  useJobPoller(allJobs, refresh);

  if (isLoading && allJobs.length === 0) {
    return <p>Loading…</p>;
  }

  if (error) {
    if (error.message === 'Unauthorized') {
      return <p>Please sign in to view your jobs.</p>;
    }
    return <p>An error occurred. Please try again.</p>;
  }

  return (
    <div>
      {conflictError && (
        <p>Job is not yet completed. Please try again later.</p>
      )}
      <table>
        <thead>
          <tr>
            <th>Display name</th>
            <th>Status</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {allJobs.map((job) => (
            <tr key={job.jobId}>
              <td>{job.displayName}</td>
              <td>
                <JobStatusBadge status={job.status} />
              </td>
              <td>{job.createdAt}</td>
              <td>
                {job.status === 'completed' && (
                  <button onClick={() => requestDownload(job.jobId)}>
                    Download
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {nextToken && (
        <button onClick={() => setPageToken(nextToken)}>Load more</button>
      )}
    </div>
  );
}

export default JobList;
