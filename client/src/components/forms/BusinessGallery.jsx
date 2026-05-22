import React from 'react';
import { Upload, X, GripVertical, Image, AlertCircle, Loader } from 'lucide-react';

var MAX_IMAGES = 5;
var MAX_FILE_SIZE = 5 * 1024 * 1024;
var ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

var BusinessGallery = function (props) {
  var businessId = props.businessId;
  var _useState = React.useState([]), images = _useState[0], setImages = _useState[1];
  var _useState2 = React.useState(true), loading = _useState2[0], setLoading = _useState2[1];
  var _useState3 = React.useState(false), uploading = _useState3[0], setUploading = _useState3[1];
  var _useState4 = React.useState(null), deletingId = _useState4[0], setDeletingId = _useState4[1];
  var _useState5 = React.useState(false), dragOver = _useState5[0], setDragOver = _useState5[1];
  var _useState6 = React.useState(null), draggedIndex = _useState6[0], setDraggedIndex = _useState6[1];
  var fileInputRef = React.useRef(null);
  var remainingSlots = Math.max(0, MAX_IMAGES - images.length);

  React.useEffect(function () { if (businessId) fetchGallery(); }, [businessId]);

  function fetchGallery() {
    setLoading(true);
    fetch('http://localhost:5000/api/businesses/' + businessId + '/gallery')
      .then(function (r) { return r.json(); })
      .then(function (data) { setImages(data.images || []); setLoading(false); })
      .catch(function () { setLoading(false); });
  }

  function uploadImageFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        fetch('http://localhost:5000/api/upload-gallery-image', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: businessId, fileName: file.name, fileType: file.type, fileData: reader.result })
        }).then(function (r) { return r.json(); })
          .then(function (data) { if (data.success) resolve(data.imageUrl); else reject(new Error(data.error || 'Upload failed')); })
          .catch(reject);
      };
      reader.onerror = function () { reject(new Error('Failed to read file')); };
      reader.readAsDataURL(file);
    });
  }

  function handleFiles(files) {
    var fileArray = Array.from(files).filter(function (f) { return f.type.startsWith('image/'); });
    if (fileArray.length === 0) return;
    if (fileArray.length > remainingSlots) { alert('You can only upload ' + remainingSlots + ' more image(s). You have ' + images.length + ' of ' + MAX_IMAGES + '.'); return; }
    var invalid = fileArray.find(function (f) { return !ALLOWED_TYPES.includes(f.type); });
    if (invalid) { alert(invalid.name + ': Only JPEG, PNG, WebP, AVIF allowed'); return; }
    var big = fileArray.find(function (f) { return f.size > MAX_FILE_SIZE; });
    if (big) { alert(big.name + ': File must be under 5MB'); return; }
    setUploading(true);
    var uploaded = 0;
    Promise.all(fileArray.map(function (file) {
      return uploadImageFile(file).then(function (url) {
        return fetch('http://localhost:5000/api/businesses/' + businessId + '/gallery', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: url, fileName: file.name })
        });
      }).then(function () { uploaded++; });
    })).then(function () { fetchGallery(); setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; });
  }

  function handleDelete(imageId) {
    setDeletingId(imageId);
    fetch('http://localhost:5000/api/businesses/' + businessId + '/gallery/' + imageId, { method: 'DELETE' })
      .then(function () { setImages(function (p) { return p.filter(function (i) { return i.id !== imageId; }); }); setDeletingId(null); })
      .catch(function () { fetchGallery(); setDeletingId(null); });
  }

  function handleReorderDrop(dropIndex) {
    if (draggedIndex === null || draggedIndex === dropIndex) { setDraggedIndex(null); return; }
    var reordered = images.slice();
    var moved = reordered.splice(draggedIndex, 1)[0];
    reordered.splice(dropIndex, 0, moved);
    setImages(reordered);
    setDraggedIndex(null);
    fetch('http://localhost:5000/api/businesses/' + businessId + '/gallery/reorder', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageIds: reordered.map(function (i) { return i.id; }) })
    }).catch(function () { fetchGallery(); });
  }

  if (loading) {
    return React.createElement('div', { className: 'gallery-container' },
      React.createElement('div', { className: 'gallery-header' }, React.createElement('h3', { className: 'gallery-title' }, 'Photo Gallery')),
      React.createElement('div', { className: 'gallery-grid' },
        [1, 2].map(function (i) { return React.createElement('div', { key: i, className: 'gallery-skeleton' }, React.createElement('div', { className: 'skeleton-shimmer' })); })
      )
    );
  }

  return React.createElement('div', { className: 'gallery-container' },
    React.createElement('div', { className: 'gallery-header' },
      React.createElement('div', null,
        React.createElement('h3', { className: 'gallery-title' }, 'Photo Gallery'),
        React.createElement('span', { className: 'gallery-count' + (images.length >= MAX_IMAGES ? ' gallery-count-full' : '') },
          React.createElement(Image, { size: 14 }), ' ' + images.length + ' of ' + MAX_IMAGES + ' photos'
        )
      ),
      React.createElement('button', { type: 'button', className: 'gallery-upload-btn', onClick: function () { if (fileInputRef.current) fileInputRef.current.click(); }, disabled: uploading || remainingSlots <= 0 },
        uploading ? [React.createElement(Loader, { key: 'l', size: 16, className: 'spinner-icon' }), ' Uploading...'] : [React.createElement(Upload, { key: 'u', size: 16 }), ' Add Photos']
      )
    ),
    React.createElement('input', { ref: fileInputRef, type: 'file', multiple: true, accept: 'image/jpeg,image/png,image/webp,image/avif', onChange: function (e) { if (e.target.files) handleFiles(e.target.files); }, style: { display: 'none' } }),
    remainingSlots > 0 && React.createElement('div', {
      className: 'gallery-dropzone' + (dragOver ? ' gallery-dropzone-active' : ''),
      onDrop: function (e) { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); },
      onDragOver: function (e) { e.preventDefault(); setDragOver(true); },
      onDragLeave: function () { setDragOver(false); },
      onClick: function () { if (fileInputRef.current) fileInputRef.current.click(); }
    },
      React.createElement(Upload, { size: 28, className: 'gallery-dropzone-icon' }),
      React.createElement('p', { className: 'gallery-dropzone-text' }, 'Drag and drop photos here'),
      React.createElement('p', { className: 'gallery-dropzone-subtext' }, 'or click to browse'),
      React.createElement('p', { className: 'gallery-dropzone-hint' }, 'JPEG, PNG, WebP, AVIF - up to 5MB each (' + remainingSlots + ' slot' + (remainingSlots === 1 ? '' : 's') + ' left)')
    ),
    images.length > 0
      ? React.createElement('div', { className: 'gallery-grid' },
          images.map(function (image, index) {
            return React.createElement('div', { key: image.id, className: 'gallery-image-card' + (draggedIndex === index ? ' gallery-image-dragging' : ''), draggable: true, onDragStart: function () { setDraggedIndex(index); }, onDragOver: function (e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, onDrop: function () { handleReorderDrop(index); }, onDragEnd: function () { setDraggedIndex(null); } },
              React.createElement('div', { className: 'gallery-drag-handle' }, React.createElement(GripVertical, { size: 14 })),
              React.createElement('img', { src: image.image_url, alt: image.file_name || 'Photo ' + (index + 1), className: 'gallery-image', loading: 'lazy' }),
              React.createElement('span', { className: 'gallery-image-number' }, index + 1),
              React.createElement('button', { type: 'button', className: 'gallery-delete-btn', onClick: function (e) { e.stopPropagation(); handleDelete(image.id); }, disabled: deletingId === image.id, title: 'Remove' },
                deletingId === image.id ? React.createElement(Loader, { size: 14, className: 'spinner-icon' }) : React.createElement(X, { size: 14 })
              )
            );
          }),
          remainingSlots > 0 && React.createElement('div', { className: 'gallery-image-card gallery-placeholder-card', onClick: function () { if (fileInputRef.current) fileInputRef.current.click(); } },
            React.createElement(Image, { size: 28, className: 'gallery-placeholder-icon' }),
            React.createElement('span', { className: 'gallery-placeholder-text' }, 'Add Photo')
          )
        )
      : React.createElement('div', { className: 'gallery-empty' },
          React.createElement(Image, { size: 48, className: 'gallery-empty-icon' }),
          React.createElement('h4', { className: 'gallery-empty-title' }, 'No photos yet'),
          React.createElement('p', { className: 'gallery-empty-text' }, 'Upload up to ' + MAX_IMAGES + ' photos to showcase your business.')
        ),
    remainingSlots <= 0 && images.length > 0 && React.createElement('div', { className: 'gallery-full-message' }, React.createElement(AlertCircle, { size: 16 }), React.createElement('span', null, 'Gallery is full. Delete some photos to upload new ones.'))
  );
};

export default BusinessGallery;