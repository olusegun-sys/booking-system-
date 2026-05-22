import React from 'react';
import { Upload, X, Image, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

var supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
var supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
var supabase = createClient(supabaseUrl, supabaseKey);

var uniqueIdCounter = 0;

function ImageUpload(props) {
  var currentImage = props.currentImage;
  var onImageUploaded = props.onImageUploaded;
  var label = props.label || 'Upload Image';
  var description = props.description || 'Click or drag to upload';
  var folder = props.folder || 'general';
  var _useState = React.useState(false);
  var uploading = _useState[0];
  var setUploading = _useState[1];
  var _useState2 = React.useState(currentImage || null);
  var preview = _useState2[0];
  var setPreview = _useState2[1];
  var _useState3 = React.useState('');
  var error = _useState3[0];
  var setError = _useState3[1];

  // Generate a truly unique ID for each instance
  var inputId = React.useRef('file-input-' + folder + '-' + (++uniqueIdCounter)).current;

  function handleFileSelect(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be less than 5MB.'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) { setError('Only JPG, PNG, WebP, and GIF are supported.'); return; }
    setError('');
    setUploading(true);

    var fileExt = file.name.split('.').pop();
    var fileName = folder + '/' + Date.now() + '-' + Math.random().toString(36).substring(2, 8) + '.' + fileExt;

    supabase.storage.from('business-images').upload(fileName, file, { cacheControl: '3600', upsert: false })
      .then(function (result) {
        if (result.error) throw new Error(result.error.message || 'Storage upload failed');
        var urlData = supabase.storage.from('business-images').getPublicUrl(fileName);
        var publicUrl = urlData.data.publicUrl;
        setPreview(publicUrl);
        if (onImageUploaded) onImageUploaded(publicUrl);
        setUploading(false);
      })
      .catch(function (err) {
        console.error('Upload failed:', err);
        setError(err.message || 'Upload failed. Please try again.');
        setUploading(false);
      });
  }

  function handleRemove() {
    setPreview(null);
    if (onImageUploaded) onImageUploaded('');
  }

  return React.createElement('div', { className: 'form-group' },
    label && React.createElement('label', {
      style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: '500', color: 'var(--gray-700)', fontSize: '14px' }
    },
      React.createElement(Image, { size: 14, strokeWidth: 2, color: 'var(--primary)' }),
      ' ' + label
    ),
    preview
      ? React.createElement('div', {
          style: { position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--gray-200)', marginBottom: '8px' }
        },
          React.createElement('img', { src: preview, alt: label, style: { width: '100%', maxHeight: '240px', objectFit: 'cover', display: 'block' } }),
          React.createElement('button', {
            onClick: handleRemove,
            style: {
              position: 'absolute', top: '8px', right: '8px', width: '32px', height: '32px',
              borderRadius: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease'
            }
          }, React.createElement(X, { size: 16, strokeWidth: 2.5 }))
        )
      : React.createElement('div', {
          style: {
            border: '2px dashed var(--gray-300)', borderRadius: '14px', padding: '40px 24px',
            textAlign: 'center', background: 'var(--gray-50)', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative'
          },
          onClick: function () { document.getElementById(inputId).click(); },
          onDragOver: function (e) { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = '#eef2ff'; },
          onDragLeave: function (e) { e.currentTarget.style.borderColor = 'var(--gray-300)'; e.currentTarget.style.background = 'var(--gray-50)'; },
          onDrop: function (e) { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--gray-300)'; e.currentTarget.style.background = 'var(--gray-50)'; handleFileSelect(e.dataTransfer.files[0]); }
        },
          uploading
            ? React.createElement('div', null,
                React.createElement(Loader2, { size: 32, strokeWidth: 2, color: 'var(--primary)', style: { animation: 'spin 0.8s linear infinite', marginBottom: '8px' } }),
                React.createElement('p', { style: { color: 'var(--gray-500)', fontSize: '14px', margin: 0 } }, 'Uploading...')
              )
            : React.createElement('div', null,
                React.createElement(Upload, { size: 32, strokeWidth: 2, color: 'var(--gray-400)', style: { marginBottom: '8px' } }),
                React.createElement('p', { style: { color: 'var(--gray-500)', fontSize: '14px', margin: 0, fontWeight: '500' } }, description),
                React.createElement('p', { style: { color: 'var(--gray-400)', fontSize: '12px', marginTop: '4px' } }, 'JPG, PNG, WebP, or GIF — max 5MB')
              )
        ),
    React.createElement('input', { id: inputId, type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: function (e) { if (e.target.files[0]) handleFileSelect(e.target.files[0]); } }),
    error && React.createElement('p', { style: { color: 'var(--danger)', fontSize: '13px', marginTop: '6px' } }, error),
    currentImage && !preview && React.createElement('p', { style: { fontSize: '12px', color: 'var(--gray-400)', marginTop: '6px' } }, 'Current image is hosted externally. Upload a new one to replace it.')
  );
}

export default ImageUpload;