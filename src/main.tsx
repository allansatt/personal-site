import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from 'react-oidc-context';
const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_qzBtha3ta",
  client_id: "562fb404mk72t8jfipjlmulq9c",
  redirect_uri: "https://fe.allansattelbergrivera.com/",
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
