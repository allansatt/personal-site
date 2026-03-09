# Task 06: Implement `JobList` component

**Status**: done
**Spec**: [spec.md](./spec.md)
**Depends on**: task-01, task-02, task-03, task-04

## Objective

Create the `JobList` component that renders the user's transcoding jobs, drives polling for pending jobs, and provides per-job download actions and pagination.

## Requirements addressed

FR-3, FR-4, FR-5, FR-6, FR-7, FR-8, FR-9, FR-10, FR-11, NFR-1, NFR-4, NFR-5

## Detailed description

Create `src/features/pokerhands/components/JobList.tsx`.

Internally uses:
- `useJobList()` for data + refresh
- `useJobPoller(jobs, refresh)` for 3-second polling
- `useDownloadUrl()` for per-job download actions
- `JobStatusBadge` for status display

Renders a table (or list) with columns: **Display name**, **Status**, **Created**, **Action**.

Per-row logic:
- `status === 'pending'`: show `<JobStatusBadge status="pending" />`; no action button.
- `status === 'completed'`: show `<JobStatusBadge status="completed" />` + "Download" button. Clicking calls `requestDownload(job.jobId)`.
- Other statuses: show `<JobStatusBadge status={job.status} />`; no action button.

Error handling in the list:
- If `useJobList` returns `error.message === "Unauthorized"`: show sign-in prompt.
- If `useDownloadUrl` returns `conflictError`: show informative inline message (e.g. "Job is not yet completed. Please try again later.").
- Any other error: show generic error message.

Pagination: when `nextToken` is returned, render a "Load more" button. On click, call `useJobList` with the new `nextToken`. Append newly loaded jobs to the existing list (do not replace).

Show a loading indicator while `isLoading` is true on initial load.

Add `JobList.test.tsx` covering: renders job rows, download button only for completed, load-more button present when nextToken, polling triggered for pending jobs.

## Acceptance criteria

- [ ] Displays display name, status badge, creation date per job
- [ ] Download button shown only for `completed` jobs
- [ ] Clicking download calls `GET /download?jobId=` and initiates browser download
- [ ] 409 on download shows informative message, no download initiated
- [ ] "Load more" button shown when `nextToken` present; appends results on click
- [ ] Polling runs every 3 s while any job is `pending`; stops when none are pending
- [ ] 401 response on job list shows sign-in prompt
- [ ] 500 response shows generic error message
- [ ] Initial load spinner shown while fetching
