# Task 07: Implement `PokerHandsPage` component

**Status**: done
**Spec**: [spec.md](./spec.md)
**Depends on**: task-05, task-06

## Objective

Create the top-level `PokerHandsPage` component that guards access based on auth state and composes `UploadForm` and `JobList`.

## Requirements addressed

FR-1, FR-14, NFR-4, NFR-5

## Detailed description

Create `src/features/pokerhands/components/PokerHandsPage.tsx`.

Auth guard using `useAuth()` from `react-oidc-context`:
- `auth.isLoading`: render a loading indicator.
- `!auth.isAuthenticated`: render a sign-in prompt (e.g. "Please sign in to use Poker Hands") with a button calling `auth.signinRedirect()`. Do not render `UploadForm` or `JobList`.
- `auth.isAuthenticated`: render `<UploadForm onUploadSuccess={handleRefresh} />` and `<JobList />`.

`handleRefresh` should trigger a re-fetch of the job list. One approach: lift a `refreshKey` counter into `PokerHandsPage` and pass it as a prop (or via context) to `JobList`; incrementing it causes `JobList` to re-mount or re-fetch.

Add `PokerHandsPage.test.tsx` covering: loading state, unauthenticated sign-in prompt, authenticated view renders form and list.

## Acceptance criteria

- [ ] Shows loading indicator while `auth.isLoading` is true
- [ ] Shows sign-in prompt (not form/list) when `!auth.isAuthenticated`
- [ ] Shows `UploadForm` + `JobList` when `auth.isAuthenticated`
- [ ] `onUploadSuccess` from `UploadForm` triggers a job list refresh
