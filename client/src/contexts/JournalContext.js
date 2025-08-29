import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import localforage from 'localforage';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const JournalContext = createContext();

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};

export const JournalProvider = ({ children }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState([]);

  // Load entries from cache on mount
  useEffect(() => {
    if (user) {
      loadFromCache();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadFromCache = async () => {
    try {
      const cachedEntries = await localforage.getItem(`entries_${user.id}`);
      const cachedTags = await localforage.getItem(`tags_${user.id}`);
      
      if (cachedEntries) {
        setEntries(cachedEntries);
      }
      if (cachedTags) {
        setTags(cachedTags);
      }
    } catch (error) {
      console.error('Cache loading error:', error);
    }
  };

  const saveToCache = async (newEntries, newTags) => {
    try {
      await localforage.setItem(`entries_${user.id}`, newEntries);
      await localforage.setItem(`tags_${user.id}`, newTags);
    } catch (error) {
      console.error('Cache saving error:', error);
    }
  };

  const fetchEntries = async (filters = {}) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`/api/journal/entries/${user.id}?${params}`);
      setEntries(response.data.entries);
      saveToCache(response.data.entries, tags);
    } catch (error) {
      console.error('Fetch entries error:', error);
      toast.error('Ошибка при загрузке записей');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTags = async () => {
    if (!user) return;
    
    try {
      const response = await axios.get(`/api/journal/tags/${user.id}`);
      setTags(response.data.tags);
      saveToCache(entries, response.data.tags);
    } catch (error) {
      console.error('Fetch tags error:', error);
    }
  };

  const createEntry = async (entryData) => {
    if (!user) return null;
    
    try {
      const response = await axios.post('/api/journal/entry', {
        ...entryData,
        telegram_user_id: user.id
      });
      
      // Refresh entries
      await fetchEntries();
      await fetchTags();
      
      toast.success('Запись создана успешно');
      return response.data.id;
    } catch (error) {
      console.error('Create entry error:', error);
      toast.error('Ошибка при создании записи');
      return null;
    }
  };

  const updateEntry = async (id, entryData) => {
    try {
      await axios.put(`/api/journal/entry/${id}`, entryData);
      
      // Refresh entries
      await fetchEntries();
      await fetchTags();
      
      toast.success('Запись обновлена успешно');
      return true;
    } catch (error) {
      console.error('Update entry error:', error);
      toast.error('Ошибка при обновлении записи');
      return false;
    }
  };

  const deleteEntry = async (id) => {
    try {
      await axios.delete(`/api/journal/entry/${id}`);
      
      // Refresh entries
      await fetchEntries();
      await fetchTags();
      
      toast.success('Запись удалена успешно');
      return true;
    } catch (error) {
      console.error('Delete entry error:', error);
      toast.error('Ошибка при удалении записи');
      return false;
    }
  };

  const uploadImages = async (entryId, files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      await axios.post(`/api/journal/entry/${entryId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Изображения загружены успешно');
      return true;
    } catch (error) {
      console.error('Upload images error:', error);
      toast.error('Ошибка при загрузке изображений');
      return false;
    }
  };

  const deleteImage = async (imageId) => {
    try {
      await axios.delete(`/api/journal/image/${imageId}`);
      toast.success('Изображение удалено успешно');
      return true;
    } catch (error) {
      console.error('Delete image error:', error);
      toast.error('Ошибка при удалении изображения');
      return false;
    }
  };

  const getEntry = async (id) => {
    try {
      const response = await axios.get(`/api/journal/entry/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get entry error:', error);
      toast.error('Ошибка при загрузке записи');
      return null;
    }
  };

  const value = {
    entries,
    tags,
    isLoading,
    fetchEntries,
    fetchTags,
    createEntry,
    updateEntry,
    deleteEntry,
    uploadImages,
    deleteImage,
    getEntry
  };

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  );
};
