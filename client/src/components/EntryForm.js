import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, Tag } from 'lucide-react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'moment/locale/ru';
import 'react-datepicker/dist/react-datepicker.css';
import { useJournal } from '../contexts/JournalContext';
import toast from 'react-hot-toast';

moment.locale('ru');

const EntryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createEntry, updateEntry, getEntry } = useJournal();
  
  const [formData, setFormData] = useState({
    date: new Date(),
    title: '',
    summary: '',
    content: '',
    tags: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id && id !== 'new') {
      loadEntry();
      setIsEditMode(true);
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadEntry = async () => {
    try {
      const data = await getEntry(id);
      if (data && data.entry) {
        setFormData({
          date: new Date(data.entry.date),
          title: data.entry.title || '',
          summary: data.entry.summary || '',
          content: data.entry.content || '',
          tags: data.entry.tags || ''
        });
      }
    } catch (error) {
      console.error('Load entry error:', error);
      toast.error('Ошибка при загрузке записи');
      navigate('/');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Заголовок обязателен';
    }
    
    if (!formData.summary.trim()) {
      newErrors.summary = 'Резюме обязательно';
    }
    
    if (!formData.date) {
      newErrors.date = 'Дата обязательна';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const entryData = {
        date: moment(formData.date).format('YYYY-MM-DD'),
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        content: formData.content.trim(),
        tags: formData.tags.trim()
      };
      
      let success = false;
      
      if (isEditMode) {
        success = await updateEntry(id, entryData);
      } else {
        const newId = await createEntry(entryData);
        success = !!newId;
        if (success) {
          navigate(`/entry/${newId}`);
          return;
        }
      }
      
      if (success) {
        navigate(`/entry/${id}`);
      }
    } catch (error) {
      console.error('Save entry error:', error);
      toast.error('Ошибка при сохранении записи');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleBlur = () => {
    // Auto-save draft (optional feature)
    // Could implement local storage draft saving here
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          <ArrowLeft size={20} />
          Назад
        </button>
        <h1>{isEditMode ? 'Редактировать запись' : 'Новая запись'}</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card">
        {/* Date */}
        <div className="form-group">
          <label className="form-label">
            <Calendar size={16} style={{ marginRight: '8px' }} />
            Дата сессии
          </label>
          <DatePicker
            selected={formData.date}
            onChange={(date) => handleInputChange('date', date)}
            dateFormat="dd.MM.yyyy"
            locale="ru"
            className={`form-input ${errors.date ? 'error' : ''}`}
            placeholderText="Выберите дату"
            maxDate={new Date()}
          />
          {errors.date && <div className="error-message">{errors.date}</div>}
        </div>

        {/* Title */}
        <div className="form-group">
          <label className="form-label">Заголовок *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            onBlur={handleBlur}
            className={`form-input ${errors.title ? 'error' : ''}`}
            placeholder="Краткий заголовок сессии"
            maxLength={100}
          />
          {errors.title && <div className="error-message">{errors.title}</div>}
        </div>

        {/* Summary */}
        <div className="form-group">
          <label className="form-label">Резюме *</label>
          <textarea
            value={formData.summary}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            onBlur={handleBlur}
            className={`form-textarea ${errors.summary ? 'error' : ''}`}
            placeholder="Краткое резюме основных моментов сессии"
            rows={4}
            maxLength={500}
          />
          {errors.summary && <div className="error-message">{errors.summary}</div>}
          <div style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color)', marginTop: '4px' }}>
            {formData.summary.length}/500 символов
          </div>
        </div>

        {/* Tags */}
        <div className="form-group">
          <label className="form-label">
            <Tag size={16} style={{ marginRight: '8px' }} />
            Теги
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            onBlur={handleBlur}
            className="form-input"
            placeholder="Теги через запятую (например: тревожность, отношения, работа)"
          />
          <div style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color)', marginTop: '4px' }}>
            Разделяйте теги запятыми
          </div>
        </div>

        {/* Content */}
        <div className="form-group">
          <label className="form-label">Дополнительные заметки</label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            onBlur={handleBlur}
            className="form-textarea"
            placeholder="Дополнительные мысли, наблюдения, планы..."
            rows={6}
          />
          <div style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color)', marginTop: '4px' }}>
            {formData.content.length} символов
          </div>
        </div>

        {/* Actions */}
        <div className="actions">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Отмена
          </button>
          <button
            type="submit"
            className={`btn ${isLoading ? 'btn-loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Сохранение...
              </>
            ) : (
              <>
                <Save size={20} />
                {isEditMode ? 'Сохранить изменения' : 'Создать запись'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="card" style={{ marginTop: '20px', background: 'var(--tg-theme-secondary-bg-color)' }}>
        <h3 style={{ marginBottom: '8px', fontSize: '16px' }}>💡 Советы по ведению дневника</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.5' }}>
          <li>Будьте конкретны в описании эмоций и переживаний</li>
          <li>Отмечайте прогресс и изменения в своем состоянии</li>
          <li>Записывайте инсайты и важные выводы</li>
          <li>Используйте теги для удобного поиска</li>
          <li>Регулярно перечитывайте старые записи</li>
        </ul>
      </div>
    </div>
  );
};

export default EntryForm;
