function JobStatusBadge({ status }: { status: string }) {
  if (status === 'pending') {
    return <span className="spinner" aria-label="Loading" />;
  }

  if (status === 'completed') {
    return <span className="badge badge--completed">Completed</span>;
  }

  return <span className="badge">{status}</span>;
}

export default JobStatusBadge;
