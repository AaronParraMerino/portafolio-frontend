import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>    
    <App />
  </React.StrictMode>
);
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    root.render(
    googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
        ) : (
      <App />
    )
);