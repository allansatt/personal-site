# Task 08: Add authenticated nav link to `LoginBar`

**Status**: done
**Spec**: [spec.md](./spec.md)
**Depends on**: none

## Objective

Add a React Router `<Link to="/pokerhands">` inside `LoginBar` that is only visible when the user is authenticated, keeping the unauthenticated landing page unchanged.

## Requirements addressed

FR-13, NFR-4, NFR-5

## Detailed description

Edit `src/features/login/components/LoginBar.tsx`.

In the `auth.isAuthenticated` branch (currently renders only a "Sign out" button), add a `<Link to="/pokerhands">Poker Hands</Link>` from `react-router-dom` alongside the existing button. The link should only appear in that branch; the unauthenticated branch and loading/error branches remain unchanged.

Keep the existing `console.log` lines if desired (or remove them — they're informational only and out of scope to clean up).

Add or extend `LoginBar.test.tsx` to cover: link present when authenticated, link absent when unauthenticated.

## Acceptance criteria

- [ ] `/pokerhands` nav link visible in `LoginBar` when `auth.isAuthenticated`
- [ ] Nav link absent when user is unauthenticated
- [ ] Existing "Sign in" and "Sign out" button behavior unchanged
- [ ] Tests cover link presence/absence per auth state
