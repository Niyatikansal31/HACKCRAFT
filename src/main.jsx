import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { ConnectivityProvider } from './context/ConnectivityContext';
import { registerAidServiceWorker } from './pwa/registerSW';
import './i18n';
import './index.css';

registerAidServiceWorker();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <ThemeProvider>
          <ConnectivityProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ConnectivityProvider>
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
