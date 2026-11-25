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
