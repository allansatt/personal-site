import { useAuth } from "react-oidc-context";
import { Link } from "react-router-dom";

const frontendBaseUrl = import.meta.env.VITE_FRONTEND_BASE_URL;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;

function LoginBar() {
  const auth = useAuth();
  const signOutRedirect = () => {
    const logoutUri = frontendBaseUrl;
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };
  if (auth.isLoading) {
    return <div className="login-bar"><p>Loading...</p></div>;
  }
  if (auth.error) {
    return <div className="login-bar"><p className="error">Error: {auth.error.message}</p></div>;
  }
  if (auth.isAuthenticated) {
    console.log(auth.isAuthenticated);
    console.log(auth.user?.id_token)
    return (
      <div className = "login-bar">
        <Link to="/pokerhands">Poker Hands</Link>
        <button onClick={() => auth.removeUser().then(() => signOutRedirect())}>Sign out</button>
      </div>
    );
  }
    
  return (
    <div className="login-bar">
      <button onClick={() => auth.signinRedirect()}>Sign in</button>
    </div>
  )
}
export default LoginBar