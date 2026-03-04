import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from 'react-oidc-context';

const frontendBaseUrl = import.meta.env.VITE_FRONTEND_BASE_URL;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_t99BmzOa5",
  client_id: clientId,
  redirect_uri: frontendBaseUrl,
  response_type: "code",
  scope: "aws.cognito.signin.user.admin email openid phone profile",
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  }};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </StrictMode>,
)
