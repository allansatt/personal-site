# Task 04: Implement `JobStatusBadge` component

**Status**: done
**Spec**: [spec.md](./spec.md)
**Depends on**: none

## Objective

Create a `JobStatusBadge` component that renders a spinning circle animation for `pending` jobs and a static badge for `completed` (or other) statuses.

## Requirements addressed

FR-5, FR-7, NFR-4, NFR-5

## Detailed description

Create `src/features/pokerhands/components/JobStatusBadge.tsx`.

Props:
```ts
{ status: string }
```

Rendering rules:
- `status === 'pending'`: render a CSS-animated spinning circle element (e.g. `<span className="spinner" aria-label="Loading" />`). No download action should be shown for this job — that enforcement lives in the parent, but the badge signals the state.
- `status === 'completed'`: render a static "Completed" badge (e.g. `<span className="badge badge--completed">Completed</span>`).
- Any other status: render the raw status string in a neutral badge.

CSS for the spinner can live in a sibling `.scss` file or inline style — follow the existing SASS pattern in the project if `.scss` files are present.

Add `JobStatusBadge.test.tsx` covering each status variant.

## Acceptance criteria

- [ ] Renders a spinning element for `status === "pending"`
- [ ] Renders a "Completed" label for `status === "completed"`
- [ ] Renders the raw status string for unknown statuses
- [ ] Component is accessible (aria-label on spinner)
- [ ] Tests cover all three rendering branches
