import { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import UploadForm from './UploadForm';
import JobList from './JobList';

function PokerHandsPage() {
  const auth = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  if (auth.isLoading) {
    return <p>Loading…</p>;
  }

  if (!auth.isAuthenticated) {
    return (
      <div>
        <p>Please sign in to use Poker Hands</p>
        <button onClick={() => auth.signinRedirect()}>Sign in</button>
      </div>
    );
  }

  return (
    <div>
      <UploadForm onUploadSuccess={handleRefresh} />
      <JobList refreshKey={refreshKey} />
    </div>
  );
}

export default PokerHandsPage;
