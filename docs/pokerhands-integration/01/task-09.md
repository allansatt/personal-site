# Task 09: Wire `PokerHandsPage` into the `/pokerhands` route

**Status**: done

**Spec**: [spec.md](./spec.md)
**Depends on**: task-07

## Objective

Replace the placeholder `<div>Poker Hands (coming soon)</div>` in `App.tsx` with the real `<PokerHandsPage />` component.

## Requirements addressed

FR-1, FR-14

## Detailed description

Edit `src/App.tsx`.

Import `PokerHandsPage` from `features/pokerhands/components/PokerHandsPage` and replace the placeholder element in the `/pokerhands` `<Route>`. The auth guard is handled inside `PokerHandsPage` itself, so no additional wrapper is needed in `App.tsx`.

## Acceptance criteria

- [ ] `/pokerhands` route renders `<PokerHandsPage />` instead of the placeholder
- [ ] Navigating to `/pokerhands` while unauthenticated shows the sign-in prompt
- [ ] Navigating to `/pokerhands` while authenticated shows the full feature page
