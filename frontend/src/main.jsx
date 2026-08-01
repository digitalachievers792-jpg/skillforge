import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <NotificationProvider>
          <ChatProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  borderRadius: '12px',
                  background: '#ffffff',
                  color: '#1e293b',
                  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.12)',
                  fontSize: '14px',
                  fontWeight: 600,
                },
                success: { iconTheme: { primary: '#14b8a6', secondary: '#ffffff' } },
                error: { iconTheme: { primary: '#f43f5e', secondary: '#ffffff' } },
              }}
            />
          </ChatProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
