# Feature: Poker Hands Integration

**Revision**: 01
**Status**: Review
**Created**: 2026-03-02

## Summary

Add a Poker Hands feature to the personal site that allows authenticated users to upload Ignition Casino hand history files, view their transcoding job status, and download completed Open Hand History (OHH) files — integrating with the three existing `ignition_hands_converter` API endpoints secured by AWS Cognito.

## Functional requirements (EARS)

- **FR-1** (State-driven) — While the user is authenticated, the personal site shall display a Poker Hands page accessible from the main navigation.
- **FR-2** (Event-driven) — When an authenticated user selects a hand history `.txt` file and submits the upload form, the frontend shall request a presigned upload URL from `POST /upload-url` with the filename, upload the file directly to S3 via the returned URL, and display a confirmation that the job was queued.
- **FR-3** (State-driven) — While the Poker Hands page is active and the user is authenticated, the frontend shall fetch and display the user's job list from `GET /files` including each job's display name, status, and creation date.
- **FR-4** (Event-driven) — When the jobs list response includes a `nextToken`, the frontend shall provide a mechanism to load additional pages of results using the `nextToken` as a query parameter.
- **FR-5** (State-driven) — While a job's status is `pending` or any non-`completed` state, the frontend shall display a loading circle animation alongside that job and shall not show a download action for that job.
- **FR-6** (State-driven) — While any job in the list has status `pending`, the frontend shall poll `GET /files` every 3 seconds and update the job list in place until no `pending` jobs remain.
- **FR-7** (State-driven) — While a job's status is `completed`, the frontend shall display a download action for that job.
- **FR-8** (Event-driven) — When an authenticated user activates the download action for a completed job, the frontend shall request a presigned download URL from `GET /download?jobId=<id>` and initiate a file download in the browser using the returned URL.
- **FR-9** (Event-driven) — When any API call returns a 401 response, the frontend shall prompt the user to sign in.
- **FR-10** (Fault) — If `GET /download` returns 409 (job not completed), then the frontend shall display an informative message and not initiate a download.
- **FR-11** (Fault) — If any API call returns a 500 response, then the frontend shall display a generic error message to the user.
- **FR-12** (Ubiquitous) — The frontend shall include the Cognito access token as a `Bearer` token in the `Authorization` header for all requests to the `ignition_hands_converter` API.
- **FR-13** (State-driven) — While the user is authenticated, the site navigation shall display a link to `/pokerhands`.
- **FR-14** (State-driven) — While the user is unauthenticated, the `/pokerhands` route shall not be accessible and the frontend shall display a sign-in prompt in its place.

## Non-functional requirements

- **NFR-1** — The job list shall render within 2 seconds of page load under normal network conditions.
- **NFR-2** — The frontend shall never expose the Cognito access token in the URL or in logs.
- **NFR-3** — File upload shall stream directly to S3 via the presigned URL; the file content shall not pass through the personal site's hosting layer.
- **NFR-4** — The feature module shall follow the existing `features/` directory convention used by `login` and `socials`.
- **NFR-5** — All new components and hooks shall be written in TypeScript with strict type safety matching the existing `tsconfig.app.json` settings.

## High-level design

### New feature module: `features/pokerhands/`

Follows the established pattern (`features/login/`, `features/socials/`) with subfolders for `components/`, `hooks/`, and optionally `utils/`.

**Hooks:**
- `useUploadUrl(filename)` — calls `POST /upload-url` with Bearer token; returns `{ uploadUrl, jobId }`.
- `useJobList(limit?, nextToken?)` — calls `GET /files`; returns paginated job items and optional `nextToken`.
- `useDownloadUrl(jobId)` — calls `GET /download?jobId=<id>`; returns presigned download URL.
- All hooks extend or reuse the existing `useApiRequest` generic hook pattern from `hooks/api.tsx`, adding an `Authorization` header sourced from `react-oidc-context`'s `auth.user?.access_token`.

**Components:**
- `PokerHandsPage` — top-level page component; guards render on auth state; composes upload form and job list.
- `UploadForm` — file input (`accept=".txt"`) + submit button; drives the upload flow (get URL → PUT to S3 → refresh list).
- `JobList` — renders a table/list of jobs from `useJobList`; shows display name, status badge, creation date, download button (when completed), and a "Load more" control when `nextToken` is present.
- `JobStatusBadge` — visual indicator for `pending` (spinning circle animation) / `completed` / other statuses.

**Polling behavior:**
- A `useJobPoller` hook (or equivalent logic inside `JobList`) runs a `setInterval` at 3-second intervals when any job in the list has `pending` status.
- The interval is cleared as soon as all visible jobs reach `completed` (or terminal error) status, or when the component unmounts.

**New page route:**
- Add a dedicated `/pokerhands` route using React Router, rendered only when `auth.isAuthenticated`.

**Navigation:**
- The existing `LoginBar` component (or a new sibling `NavBar` component) shall render a React Router `<Link>` to `/pokerhands` when the user is authenticated.
- The nav link is hidden when the user is unauthenticated, keeping the unauthenticated landing page unchanged.

### Authentication flow

The Cognito access token is already available via `react-oidc-context` (`useAuth` hook → `auth.user?.access_token`). All API hooks will read this token and attach it as `Authorization: Bearer <token>`. No new auth infrastructure is required.

### API base URL

All three endpoints live under `https://api.allansattelbergrivera.com` (same domain as the existing `/socials` endpoint). The base URL should be centralized in a shared config or environment variable to keep parity with existing patterns.

### Upload flow sequence

1. User selects file → `UploadForm` calls `POST /upload-url` with filename + Bearer token.
2. Backend returns `{ uploadUrl, jobId }`.
3. Frontend PUTs file bytes directly to `uploadUrl` (presigned S3 URL, no auth header needed).
4. On success, frontend refreshes the job list to show the new `pending` job.

## Constraints and assumptions

- Assumes the `ignition_hands_converter` API Gateway is already deployed and accessible at `https://api.allansattelbergrivera.com`.
- Assumes CORS is configured on the API Gateway to allow requests from `https://fe.allansattelbergrivera.com`.
- The Cognito User Pool at `auth.allansattelbergrivera.com` (Client ID `23hqn3k8tir305rg4gcj859b75`) is the same pool that authorizes the `ignition_hands_converter` API Gateway endpoints.
- No new backend infrastructure changes are in scope for this feature.
- React Router will be introduced as a new dependency to support the `/pokerhands` dedicated route alongside the existing root route.

## Out of scope

- Changes to the `ignition_hands_converter` backend, Lambda functions, or Terraform infrastructure.
- Adding new API endpoints beyond the three already implemented.
- Displaying the parsed hand history content inline (only upload/download of files).
- Admin or multi-user views (job list is scoped to the authenticated user only).
- Mobile-specific responsive design beyond what the existing SASS setup provides.
