# Task 02: Implement `useDownloadUrl` hook

**Status**: done
**Spec**: [spec.md](./spec.md)
**Depends on**: none

## Objective

Create the `useDownloadUrl` hook that fetches a presigned download URL from `GET /download?jobId=<id>` and triggers a browser file download on success.

## Requirements addressed

FR-8, FR-9, FR-10, FR-11, FR-12, NFR-2, NFR-5

## Detailed description

Create `src/features/pokerhands/hooks/useDownloadUrl.tsx`.

The hook exposes an imperative `requestDownload(jobId: string)` function (not auto-fetch on mount) and returns:
```ts
{
  isLoading: boolean;
  error: Error | null;
  conflictError: boolean;   // true when API returns 409
}
```

On success: create an `<a>` element with the returned presigned URL, set `download` attribute, click it programmatically, then remove it — triggering browser download without navigating away. Do not expose the presigned URL in state or logs.

On 401: set `error.message === "Unauthorized"`.
On 409: set `conflictError: true` and a descriptive `error` (e.g. `"Job not yet completed"`).
On 500: set a generic error.

Add `useDownloadUrl.test.tsx` covering: initial state, successful download trigger (verify anchor click), 401, 409 conflict, 500 error.

## Acceptance criteria

- [ ] `requestDownload(jobId)` calls `GET /download?jobId=<id>` with `Authorization: Bearer <token>`
- [ ] On success a browser download is initiated via a programmatically clicked anchor
- [ ] 401 sets `error.message === "Unauthorized"`
- [ ] 409 sets `conflictError: true` with an informative error message
- [ ] 500 sets a generic error
- [ ] Hook never stores the presigned URL in component state beyond the click
- [ ] All scenarios covered by unit tests
