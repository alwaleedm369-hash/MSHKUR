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