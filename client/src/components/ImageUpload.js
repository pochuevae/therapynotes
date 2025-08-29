import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useJournal } from '../contexts/JournalContext';
import toast from 'react-hot-toast';

const ImageUpload = ({ entryId, onClose, onSuccess }) => {
  const { uploadImages } = useJournal();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file)
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Выберите изображения для загрузки');
      return;
    }

    setIsUploading(true);
    try {
      const files = uploadedFiles.map(f => f.file);
      const success = await uploadImages(entryId, files);
      
      if (success) {
        // Clean up preview URLs
        uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
        onSuccess();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Ошибка при загрузке изображений');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    // Clean up preview URLs
    uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="card" style={{ 
        maxWidth: '500px', 
        width: '100%', 
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--tg-theme-hint-color)'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Добавить изображения</h2>
          <button 
            onClick={handleClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Dropzone */}
        <div 
          {...getRootProps()} 
          className={`dropzone ${isDragActive ? 'active' : ''}`}
          style={{ marginBottom: '20px' }}
        >
          <input {...getInputProps()} />
          <Upload size={32} style={{ marginBottom: '12px', opacity: 0.7 }} />
          {isDragActive ? (
            <p>Отпустите файлы здесь...</p>
          ) : (
            <div>
              <p style={{ marginBottom: '8px', fontWeight: '500' }}>
                Перетащите изображения сюда или нажмите для выбора
              </p>
              <p style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
                Поддерживаются: JPG, PNG (максимум 5 файлов, до 5MB каждый)
              </p>
            </div>
          )}
        </div>

        {/* Preview */}
        {uploadedFiles.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>
              Выбранные изображения ({uploadedFiles.length}/5)
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
              gap: '8px'
            }}>
              {uploadedFiles.map((file) => (
                <div key={file.id} style={{ position: 'relative' }}>
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    style={{
                      width: '100%',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                  <button
                    onClick={() => removeFile(file.id)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(220, 53, 69, 0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}
                  >
                    ×
                  </button>
                  <div style={{ 
                    fontSize: '10px', 
                    color: 'var(--tg-theme-hint-color)',
                    marginTop: '4px',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {file.file.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleClose}
            className="btn btn-secondary"
            style={{ flex: 1 }}
            disabled={isUploading}
          >
            Отмена
          </button>
          <button
            onClick={handleUpload}
            className={`btn ${isUploading ? 'btn-loading' : ''}`}
            style={{ flex: 1 }}
            disabled={isUploading || uploadedFiles.length === 0}
          >
            {isUploading ? (
              <>
                <div className="spinner"></div>
                Загрузка...
              </>
            ) : (
              <>
                <ImageIcon size={16} />
                Загрузить ({uploadedFiles.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
