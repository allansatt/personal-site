# Task 03: Implement `useJobPoller` hook

**Status**: done
**Spec**: [spec.md](./spec.md)
**Depends on**: task-01

## Objective

Create the `useJobPoller` hook that runs a 3-second polling interval against `GET /files` while any job has `pending` status, stopping automatically when all visible jobs reach a terminal state or when the component unmounts.

## Requirements addressed

FR-6, NFR-5

## Detailed description

Create `src/features/pokerhands/hooks/useJobPoller.tsx`.

The hook accepts:
```ts
useJobPoller(jobs: Job[], refresh: () => void): void
```

Uses `useEffect` + `setInterval` (3000 ms). Starts polling when `jobs.some(j => j.status === 'pending')` and the component is mounted. Clears the interval via cleanup function when:
- No job has `pending` status (all are `completed` or other terminal state), or
- The component unmounts.

The `refresh` callback is the one returned by `useJobList`. The hook should not own its own fetch; it only drives the refresh cycle.

Add `useJobPoller.test.tsx` covering: interval started when pending jobs present, interval cleared when no pending jobs, interval cleared on unmount.

## Acceptance criteria

- [ ] Interval fires every 3 seconds while any job has `status === "pending"`
- [ ] Interval is cleared when all jobs leave `pending` status
- [ ] Interval is cleared on component unmount (no memory leaks)
- [ ] No fetch logic inside the hook; only calls `refresh()`
- [ ] Tests verify interval start/stop behavior using fake timers
