<<<<<<< HEAD
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from '@/App';
import '@shared/styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: 'toast',
            success: 'toast-success',
            error: 'toast-error',
            warning: 'toast-warning',
            info: 'toast-info',
          },
          duration: 4000,
          style: {
            background: 'var(--surface-0, white)',
            border: '1px solid var(--surface-200)',
            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
=======
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import './mobile-wa.css';
import './brand-ui.css';
import './styles-guest-landing.css';
import './car-ad-workflow.css';
import './ops-screens.css';
import { LocaleProvider } from './i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><LocaleProvider><App /></LocaleProvider></React.StrictMode>,
);
>>>>>>> 5cac2c6638c612a91f5d8042e523b39575bf6267
