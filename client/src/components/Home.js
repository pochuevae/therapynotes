import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Mic } from 'lucide-react';
import moment from 'moment';
import 'moment/locale/ru';
import { useAuth } from '../contexts/AuthContext';
import { useJournal } from '../contexts/JournalContext';
import EntryCard from './EntryCard';

moment.locale('ru');

const Home = () => {
  const { user } = useAuth();
  const { entries, tags, isLoading, fetchEntries, fetchTags } = useJournal();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEntries();
      fetchTags();
    }
  }, [user]);

  const handleSearch = () => {
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (selectedTag) filters.tag = selectedTag;
    fetchEntries(filters);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedTag('');
    fetchEntries();
  };

  const sortedMonths = Object.keys(entries).sort((a, b) => b.localeCompare(a));

  const totalEntries = Object.values(entries).flat().length;

  return (
    <div className="container">
      <div className="header">
        <h1>Терапевтический дневник</h1>
        <Link to="/entry/new" className="btn">
          <Plus size={20} />
          Новая запись
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="search-container">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Поиск в записях..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="btn">
            <Search size={16} />
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`btn ${showFilters ? 'btn-secondary' : ''}`}
          >
            <Filter size={16} />
          </button>
        </div>

        {showFilters && (
          <div className="filter-tags">
            <button
              onClick={handleClearFilters}
              className={`filter-tag ${!selectedTag ? 'active' : ''}`}
            >
              Все
            </button>
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`filter-tag ${selectedTag === tag ? 'active' : ''}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Voice Message Reminder */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Mic size={24} />
          <div>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Отправьте голосовое сообщение боту</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
              Для быстрого создания записи отправьте голосовое сообщение в Telegram
            </p>
          </div>
        </div>
      </div>

      {/* Entries List */}
      {isLoading ? (
        <div className="loading">
          <div className="spinner"></div>
          <span style={{ marginLeft: '12px' }}>Загрузка записей...</span>
        </div>
      ) : totalEntries === 0 ? (
        <div className="empty-state">
          <h3>Добро пожаловать в ваш терапевтический дневник!</h3>
          <p>
            Здесь вы можете записывать и анализировать ваши терапевтические сессии.
            <br />
            Начните с создания первой записи или отправьте голосовое сообщение боту.
          </p>
          <Link to="/entry/new" className="btn" style={{ marginTop: '20px' }}>
            <Plus size={20} />
            Создать первую запись
          </Link>
        </div>
      ) : (
        <div>
          {sortedMonths.map(month => {
            const monthEntries = entries[month] || [];
            const monthDate = moment(month, 'YYYY-MM');
            
            return (
              <div key={month} className="month-group">
                <h2 className="month-title">
                  {monthDate.format('MMMM YYYY')}
                  <span style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)', marginLeft: '8px' }}>
                    ({monthEntries.length} {monthEntries.length === 1 ? 'запись' : 'записи'})
                  </span>
                </h2>
                
                {monthEntries.map(entry => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
