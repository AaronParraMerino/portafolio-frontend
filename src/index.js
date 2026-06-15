import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { installInFlightFetchDeduplication } from './shared/services/inFlightFetch';

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const root = ReactDOM.createRoot(document.getElementById('root'));

installInFlightFetchDeduplication();

const appTree = googleClientId ? (
  <GoogleOAuthProvider clientId={googleClientId}>
    <App />
  </GoogleOAuthProvider>
) : (
  <App />
);

root.render(
  <React.StrictMode>
    {appTree}
  </React.StrictMode>
);
