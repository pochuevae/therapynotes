import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children, user: initialUser }) => {
  const [user, setUser] = useState(initialUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      if (initialUser) {
        try {
          // Register/update user with backend
          const response = await axios.post('/api/bot/user', {
            telegram_user_id: initialUser.id,
            username: initialUser.username,
            first_name: initialUser.first_name,
            last_name: initialUser.last_name
          });
          
          setUser(response.data.user);
        } catch (error) {
          console.error('User initialization error:', error);
          toast.error('Ошибка при инициализации пользователя');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [initialUser]);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
