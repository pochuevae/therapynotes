import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, Tag, Mic, Edit3, Image as ImageIcon } from 'lucide-react';
import moment from 'moment';
import 'moment/locale/ru';
import { useJournal } from '../contexts/JournalContext';
import ImageUpload from './ImageUpload';

moment.locale('ru');

const EntryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEntry, deleteEntry, deleteImage } = useJournal();
  
  const [entry, setEntry] = useState(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showImageUpload, setShowImageUpload] = useState(false);

  useEffect(() => {
    loadEntry();
  }, [id]);

  const loadEntry = async () => {
    setIsLoading(true);
    try {
      const data = await getEntry(id);
      if (data) {
        setEntry(data.entry);
        setImages(data.images || []);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Load entry error:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      const success = await deleteEntry(id);
      if (success) {
        navigate('/');
      }
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (window.confirm('Удалить это изображение?')) {
      const success = await deleteImage(imageId);
      if (success) {
        setImages(images.filter(img => img.id !== imageId));
      }
    }
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('DD MMMM YYYY');
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'bot_voice':
        return <Mic size={16} />;
      case 'manual':
        return <Edit3 size={16} />;
      default:
        return <Edit3 size={16} />;
    }
  };

  const getSourceText = (source) => {
    switch (source) {
      case 'bot_voice':
        return 'Создано из голосового сообщения';
      case 'manual':
        return 'Создано вручную';
      default:
        return 'Запись';
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <span style={{ marginLeft: '12px' }}>Загрузка записи...</span>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Запись не найдена</h3>
          <Link to="/" className="btn">Вернуться к списку</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          <ArrowLeft size={20} />
          Назад
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to={`/entry/${id}/edit`} className="btn">
            <Edit size={20} />
            Редактировать
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            <Trash2 size={20} />
            Удалить
          </button>
        </div>
      </div>

      {/* Entry Content */}
      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title" style={{ fontSize: '24px', marginBottom: '8px' }}>
              {entry.title || 'Без названия'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={16} />
                <span>{formatDate(entry.date)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {getSourceIcon(entry.source)}
                <span style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
                  {getSourceText(entry.source)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        {entry.summary && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '8px', color: 'var(--tg-theme-text-color)' }}>Резюме</h3>
            <p style={{ lineHeight: '1.6', color: 'var(--tg-theme-text-color)' }}>
              {entry.summary}
            </p>
          </div>
        )}

        {/* Tags */}
        {entry.tags && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '8px', color: 'var(--tg-theme-text-color)' }}>Теги</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {entry.tags.split(',').map((tag, index) => (
                <span key={index} className="tag">
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {entry.content && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '8px', color: 'var(--tg-theme-text-color)' }}>Дополнительные заметки</h3>
            <div style={{ 
              lineHeight: '1.6', 
              color: 'var(--tg-theme-text-color)',
              whiteSpace: 'pre-wrap'
            }}>
              {entry.content}
            </div>
          </div>
        )}

        {/* Transcript */}
        {entry.transcript && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '8px', color: 'var(--tg-theme-text-color)' }}>Транскрипт</h3>
            <div style={{ 
              padding: '16px',
              background: 'var(--tg-theme-secondary-bg-color)',
              borderRadius: '8px',
              lineHeight: '1.6',
              color: 'var(--tg-theme-text-color)',
              whiteSpace: 'pre-wrap'
            }}>
              {entry.transcript}
            </div>
          </div>
        )}

        {/* Images */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ color: 'var(--tg-theme-text-color)' }}>Изображения</h3>
            <button 
              onClick={() => setShowImageUpload(true)} 
              className="btn"
              style={{ padding: '8px 12px', fontSize: '14px' }}
            >
              <ImageIcon size={16} />
              Добавить
            </button>
          </div>
          
          {images.length > 0 ? (
            <div className="image-gallery">
              {images.map(image => (
                <div key={image.id} className="image-item">
                  <img 
                    src={`/${image.file_path}`} 
                    alt={image.file_name}
                    style={{ cursor: 'pointer' }}
                    onClick={() => window.open(`/${image.file_path}`, '_blank')}
                  />
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="image-remove"
                    title="Удалить изображение"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              color: 'var(--tg-theme-hint-color)',
              border: '2px dashed var(--tg-theme-hint-color)',
              borderRadius: '8px'
            }}>
              <ImageIcon size={32} style={{ marginBottom: '8px' }} />
              <p>Нет изображений</p>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div style={{ 
          padding: '16px', 
          background: 'var(--tg-theme-secondary-bg-color)', 
          borderRadius: '8px',
          fontSize: '14px',
          color: 'var(--tg-theme-hint-color)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span>Создано: {moment(entry.created_at).format('DD.MM.YYYY HH:mm')}</span>
            {entry.updated_at !== entry.created_at && (
              <span>Обновлено: {moment(entry.updated_at).format('DD.MM.YYYY HH:mm')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Image Upload Modal */}
      {showImageUpload && (
        <ImageUpload 
          entryId={id} 
          onClose={() => setShowImageUpload(false)}
          onSuccess={() => {
            setShowImageUpload(false);
            loadEntry();
          }}
        />
      )}
    </div>
  );
};

export default EntryDetail;
