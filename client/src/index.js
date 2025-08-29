import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App';

// Initialize Telegram Mini App
window.Telegram.WebApp.ready();
window.Telegram.WebApp.expand();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--tg-theme-bg-color, #ffffff)',
            color: 'var(--tg-theme-text-color, #000000)',
            border: '1px solid var(--tg-theme-hint-color, #999999)',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
