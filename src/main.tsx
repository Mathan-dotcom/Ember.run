import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/meridian.css';
import { PrivyAuthProvider } from './providers/PrivyAuthProvider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <PrivyAuthProvider>
      <App />
    </PrivyAuthProvider>
  </React.StrictMode>
);
