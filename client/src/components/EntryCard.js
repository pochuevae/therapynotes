import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Tag, Mic, Edit } from 'lucide-react';
import moment from 'moment';
import 'moment/locale/ru';

moment.locale('ru');

const EntryCard = ({ entry }) => {
  const formatDate = (dateString) => {
    return moment(dateString).format('DD MMMM YYYY');
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'bot_voice':
        return <Mic size={16} />;
      case 'manual':
        return <Edit size={16} />;
      default:
        return <Edit size={16} />;
    }
  };

  const getSourceText = (source) => {
    switch (source) {
      case 'bot_voice':
        return 'Голосовое сообщение';
      case 'manual':
        return 'Ручная запись';
      default:
        return 'Запись';
    }
  };

  return (
    <Link to={`/entry/${entry.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card fade-in" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
        <div className="card-header">
          <div style={{ flex: 1 }}>
            <h3 className="card-title">{entry.title || 'Без названия'}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <Calendar size={14} />
              <span className="card-date">{formatDate(entry.date)}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {getSourceIcon(entry.source)}
                <span style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color)' }}>
                  {getSourceText(entry.source)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {entry.summary && (
          <p className="card-summary" style={{ 
            marginBottom: '12px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {entry.summary}
          </p>
        )}
        
        {entry.tags && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
            {entry.tags.split(',').map((tag, index) => (
              <span key={index} className="tag" style={{ fontSize: '11px' }}>
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
        
        {entry.transcript && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px', 
            background: 'var(--tg-theme-secondary-bg-color)', 
            borderRadius: '6px',
            fontSize: '12px',
            color: 'var(--tg-theme-hint-color)',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            <strong>Транскрипт:</strong> {entry.transcript.substring(0, 100)}...
          </div>
        )}
      </div>
    </Link>
  );
};

export default EntryCard;
