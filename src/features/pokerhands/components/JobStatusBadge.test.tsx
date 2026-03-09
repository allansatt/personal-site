import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import JobStatusBadge from './JobStatusBadge';

describe('JobStatusBadge', () => {
  it('renders a spinning element with aria-label for status "pending"', () => {
    render(<JobStatusBadge status="pending" />);

    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toBeTruthy();
    expect(spinner.className).toContain('spinner');
  });

  it('renders a "Completed" label for status "completed"', () => {
    render(<JobStatusBadge status="completed" />);

    const badge = screen.getByText('Completed');
    expect(badge).toBeTruthy();
    expect(badge.className).toContain('badge');
    expect(badge.className).toContain('badge--completed');
  });

  it('renders the raw status string for unknown statuses', () => {
    render(<JobStatusBadge status="failed" />);

    const badge = screen.getByText('failed');
    expect(badge).toBeTruthy();
    expect(badge.className).toContain('badge');
    expect(badge.className).not.toContain('badge--completed');
  });
});
