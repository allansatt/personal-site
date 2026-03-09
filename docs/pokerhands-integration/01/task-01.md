# Task 01: Implement `useJobList` hook

**Status**: done
**Spec**: [spec.md](./spec.md)
**Depends on**: none

## Objective

Create the `useJobList` hook that fetches the authenticated user's job list from `GET /files`, supporting optional pagination via `nextToken`.

## Requirements addressed

FR-3, FR-4, FR-9, FR-11, FR-12, NFR-2, NFR-4, NFR-5

## Detailed description

Create `src/features/pokerhands/hooks/useJobList.tsx`.

The hook signature should be:
```ts
useJobList(params?: { limit?: number; nextToken?: string })
```

It calls `GET ${API_BASE_URL}/files` (from `src/config.ts`) with:
- `Authorization: Bearer <token>` header (token from `useAuth().user?.access_token`)
- Optional `limit` and `nextToken` as query parameters when provided

Returns:
```ts
{
  jobs: Job[];
  nextToken: string | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;   // re-fetches the same page
}
```

Define the `Job` type (exportable) with at minimum: `jobId: string`, `displayName: string`, `status: string`, `createdAt: string`.

On 401 response set a distinct `error` (message: `"Unauthorized"`) so the caller can prompt sign-in. On 500 set a generic error. Do not surface the token in error messages or logs.

Add a sibling `useJobList.test.tsx` covering: initial state, successful fetch, pagination params forwarded, 401 handling, 500 handling.

## Acceptance criteria

- [ ] `useJobList()` calls `GET /files` with `Authorization: Bearer <token>`
- [ ] `nextToken` query param is appended when provided; omitted when not
- [ ] Returns typed `Job[]` and `nextToken` from the response
- [ ] 401 response sets `error.message === "Unauthorized"`
- [ ] 500 response sets a generic error
- [ ] `refresh()` re-triggers the fetch without changing params
- [ ] All acceptance criteria covered by unit tests in `useJobList.test.tsx`
