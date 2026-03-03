# Task list: Poker Hands Integration

**Spec**: docs/pokerhands-integration/01/spec.md
**Generated**: 2026-03-03

## Recommended technologies

- **React Router v6** — dedicated `/pokerhands` route and `<Link>` navigation
- **TypeScript** — strict typing for all new hooks and components (existing project standard)
- **React** + **react-oidc-context** — auth guard and Cognito Bearer token injection (existing)
- **AWS S3** presigned URLs — direct browser-to-S3 upload (existing backend, consumed via fetch PUT)
- **AWS API Gateway + Cognito** — three backend endpoints already deployed; consumed via `fetch` with Authorization header

## Tasks

### Setup

- [ ] Install `react-router-dom` and wrap `App.tsx` in a `<BrowserRouter>`, converting the existing render to a route at `/` and adding a placeholder route at `/pokerhands`.

### API config

- [ ] Centralize the API base URL (`https://api.allansattelbergrivera.com`) in a shared config file (e.g. `src/config.ts`) and update the existing `useSocialsRequest` hook to consume it, establishing the pattern for new hooks.

### Feature module: hooks

- [ ] Implement `useUploadUrl` hook in `features/pokerhands/hooks/` — accepts a filename, calls `POST /upload-url` with the Cognito Bearer token, and returns `{ uploadUrl, jobId }`.
- [ ] Implement `useJobList` hook in `features/pokerhands/hooks/` — calls `GET /files` with optional `limit` and `nextToken` query params and the Cognito Bearer token; returns `{ items, nextToken }`.
- [ ] Implement `useDownloadUrl` hook in `features/pokerhands/hooks/` — accepts a `jobId`, calls `GET /download?jobId=<id>` with the Cognito Bearer token, and returns the presigned download URL; surfaces 409 as a distinct error state.
- [ ] Implement `useJobPoller` hook in `features/pokerhands/hooks/` — accepts the current job list and a refresh callback; starts a `setInterval` at 3 seconds when any job has `pending` status and clears it when all jobs are terminal or the component unmounts.

### Feature module: components

- [ ] Implement `JobStatusBadge` component in `features/pokerhands/components/` — renders a CSS spinning circle animation for `pending` status and a static label for `completed` or other statuses.
- [ ] Implement `UploadForm` component in `features/pokerhands/components/` — renders a file input (`accept=".txt"`) and submit button; on submit calls `useUploadUrl`, PUTs the file to the presigned S3 URL (no Authorization header on the S3 PUT), then triggers a job list refresh; shows inline confirmation on success and error messages on failure.
- [ ] Implement `JobList` component in `features/pokerhands/components/` — renders the job list from `useJobList`; shows display name, `JobStatusBadge`, creation date, and a download button for completed jobs; includes a "Load more" control when `nextToken` is present; integrates `useJobPoller` to auto-refresh while pending jobs exist.
- [ ] Implement `PokerHandsPage` component in `features/pokerhands/components/` — guards on `auth.isAuthenticated` (shows sign-in prompt when unauthenticated); composes `UploadForm` and `JobList`; handles 401 responses from any hook by prompting the user to sign in and 500 responses with a generic error message.

### Routing and navigation

- [ ] Wire `PokerHandsPage` into the `/pokerhands` route in `App.tsx` so the route renders the page when authenticated.
- [ ] Add a React Router `<Link to="/pokerhands">` inside `LoginBar` (or a sibling `NavBar` component) that is rendered only when `auth.isAuthenticated`, and hidden otherwise.
