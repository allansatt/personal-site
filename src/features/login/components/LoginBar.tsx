import { useAuth } from "react-oidc-context";

function LoginBar() {
  const auth = useAuth();
  const signOutRedirect = () => {
    const clientId = "562fb404mk72t8jfipjlmulq9c";
    const logoutUri = "https://fe.allansattelbergrivera.com/";
    const cognitoDomain = "https://auth.allansattelbergrivera.com";
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
    console.log(auth.user?.access_token)
    return (
      <div className = "login-bar">
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