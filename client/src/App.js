import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './components/Home';
import EntryDetail from './components/EntryDetail';
import EntryForm from './components/EntryForm';
import { AuthProvider } from './contexts/AuthContext';
import { JournalProvider } from './contexts/JournalContext';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize Telegram Mini App
        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.ready();
          window.Telegram.WebApp.expand();
          
          // Get user data from Telegram
          const userData = window.Telegram.WebApp.initDataUnsafe?.user;
          
          if (userData) {
            setUser({
              id: userData.id.toString(),
              username: userData.username,
              first_name: userData.first_name,
              last_name: userData.last_name
            });
          }
        }
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  if (isLoading) {
    return (
      <div className="loading">
        <div>Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Ошибка авторизации</h3>
          <p>Приложение должно быть открыто через Telegram.</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider user={user}>
      <JournalProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/entry/:id" element={<EntryDetail />} />
            <Route path="/entry/new" element={<EntryForm />} />
            <Route path="/entry/:id/edit" element={<EntryForm />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </div>
      </JournalProvider>
    </AuthProvider>
  );
}

export default App;
