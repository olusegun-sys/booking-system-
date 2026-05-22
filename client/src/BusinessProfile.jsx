import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Save, Camera, X, CheckCircle, AlertCircle, Edit3, ExternalLink, ArrowLeft } from 'lucide-react';
import ImageUpload from './components/forms/ImageUpload';
import BusinessGallery from './components/forms/BusinessGallery';
import API_BASE from './config';

function BusinessProfile({ business, onBack, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: business?.name || '',
    email: business?.email || '',
    phone: business?.phone || '',
    address: business?.address || '',
    city: business?.city || '',
    state: business?.state || '',
    description: business?.description || '',
    about_text: business?.about_text || '',
    website: business?.website || '',
    cover_image: business?.cover_image || '',
    logo_url: business?.logo_url || ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(function() {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return function() { window.removeEventListener('resize', handleResize); };
  }, []);

  useEffect(function() {
    if (business) {
      setFormData({
        name: business.name || '',
        email: business.email || '',
        phone: business.phone || '',
        address: business.address || '',
        city: business.city || '',
        state: business.state || '',
        description: business.description || '',
        about_text: business.about_text || '',
        website: business.website || '',
        cover_image: business.cover_image || '',
        logo_url: business.logo_url || ''
      });
    }
  }, [business]);

  function showMessage(type, text) {
    setMessage({ type: type, text: text });
    setTimeout(function() { setMessage({ type: '', text: '' }); }, 3000);
  }

  function handleChange(field, value) {
    setFormData(function(prev) {
      var updated = {};
      for (var key in prev) updated[key] = prev[key];
      updated[field] = value;
      return updated;
    });
  }

  function handleSave() {
    setSaving(true);
    fetch(API_BASE + '/api/businesses/' + business.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cover_image: formData.cover_image,
        logo_url: formData.logo_url,
        about_text: formData.about_text,
        description: formData.description,
        website: formData.website
      })
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) {
          showMessage('success', 'Profile updated successfully');
          setIsEditing(false);
          if (onUpdate) onUpdate(data.business);
        } else {
          showMessage('error', data.error || 'Failed to update profile');
        }
      })
      .catch(function() { showMessage('error', 'Something went wrong. Please try again.'); })
      .finally(function() { setSaving(false); });
  }

  var containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: isDesktop ? '32px' : '16px'
  };

  var headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isDesktop ? '32px' : '24px',
    flexWrap: 'wrap',
    gap: '16px'
  };

  var titleStyle = {
    fontSize: isDesktop ? '24px' : '20px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  };

  var backButtonStyle = {
    padding: isDesktop ? '10px 20px' : '8px 16px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '10px',
    fontSize: isDesktop ? '14px' : '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  var editButtonStyle = {
    padding: isDesktop ? '10px 20px' : '8px 16px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: isDesktop ? '14px' : '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  var gridStyle = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr',
    gap: isDesktop ? '32px' : '20px'
  };

  var cardStyle = {
    backgroundColor: 'white',
    borderRadius: isDesktop ? '20px' : '16px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  };

  var cardHeaderStyle = {
    padding: isDesktop ? '20px 24px' : '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  var cardTitleStyle = {
    fontSize: isDesktop ? '18px' : '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  };

  var cardBodyStyle = {
    padding: isDesktop ? '24px' : '20px'
  };

  var infoRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9',
    flexWrap: 'wrap',
    gap: '8px'
  };

  var labelStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    minWidth: '100px'
  };

  var valueStyle = {
    fontSize: '14px',
    color: '#1e293b',
    flex: 1,
    wordBreak: 'break-word'
  };

  var editableFieldStyle = {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  };

  var textareaStyle = {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    minHeight: '100px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  };

  return React.createElement('div', { style: containerStyle },
    React.createElement('div', { style: headerStyle },
      React.createElement('button', { onClick: onBack, style: backButtonStyle },
        React.createElement(ArrowLeft, { size: 16 }),
        ' Back to Dashboard'
      ),
      React.createElement('div', { style: { display: 'flex', gap: '12px' } },
        !isEditing && React.createElement('button', { onClick: function() { setIsEditing(true); }, style: editButtonStyle },
          React.createElement(Edit3, { size: 14 }), ' Edit Profile'
        ),
        isEditing && React.createElement('button', { onClick: handleSave, disabled: saving, style: { ...editButtonStyle, backgroundColor: '#10b981' } },
          React.createElement(Save, { size: 14 }), saving ? 'Saving...' : 'Save Changes'
        ),
        isEditing && React.createElement('button', { onClick: function() { setIsEditing(false); }, style: { ...editButtonStyle, backgroundColor: '#f1f5f9', color: '#475569' } }, 'Cancel')
      )
    ),

    message.text && React.createElement('div', { style: {
      padding: '12px 16px',
      borderRadius: '10px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
      color: message.type === 'success' ? '#065f46' : '#991b1b'
    } },
      message.type === 'success' ? React.createElement(CheckCircle, { size: 18 }) : React.createElement(AlertCircle, { size: 18 }),
      message.text
    ),

    React.createElement('div', { style: gridStyle },
      // Basic Information Card
      React.createElement('div', { style: cardStyle },
        React.createElement('div', { style: cardHeaderStyle },
          React.createElement(Building2, { size: isDesktop ? 20 : 18, color: '#4f46e5' }),
          React.createElement('h3', { style: cardTitleStyle }, 'Basic Information')
        ),
        React.createElement('div', { style: cardBodyStyle },
          React.createElement('div', { style: infoRowStyle },
            React.createElement('span', { style: labelStyle }, 'Business Name'),
            isEditing ?
              React.createElement('input', {
                type: 'text',
                value: formData.name,
                onChange: function(e) { handleChange('name', e.target.value); },
                style: editableFieldStyle
              }) :
              React.createElement('span', { style: valueStyle }, formData.name)
          ),
          React.createElement('div', { style: infoRowStyle },
            React.createElement('span', { style: labelStyle }, 'Email'),
            React.createElement('span', { style: { ...valueStyle, display: 'flex', alignItems: 'center', gap: '6px' } },
              React.createElement(Mail, { size: 14, color: '#64748b' }), formData.email
            )
          ),
          React.createElement('div', { style: infoRowStyle },
            React.createElement('span', { style: labelStyle }, 'Phone'),
            React.createElement('span', { style: { ...valueStyle, display: 'flex', alignItems: 'center', gap: '6px' } },
              React.createElement(Phone, { size: 14, color: '#64748b' }), formData.phone
            )
          ),
          React.createElement('div', { style: infoRowStyle },
            React.createElement('span', { style: labelStyle }, 'Location'),
            React.createElement('span', { style: { ...valueStyle, display: 'flex', alignItems: 'center', gap: '6px' } },
              React.createElement(MapPin, { size: 14, color: '#64748b' }), formData.city + ', ' + formData.state
            )
          ),
          React.createElement('div', { style: infoRowStyle },
            React.createElement('span', { style: labelStyle }, 'Website'),
            formData.website ?
              React.createElement('a', { href: formData.website, target: '_blank', style: { ...valueStyle, color: '#4f46e5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' } },
                formData.website, React.createElement(ExternalLink, { size: 12 })
              ) :
              React.createElement('span', { style: valueStyle }, 'Not provided')
          )
        )
      ),

      // About Section Card
      React.createElement('div', { style: cardStyle },
        React.createElement('div', { style: cardHeaderStyle },
          React.createElement(Globe, { size: isDesktop ? 20 : 18, color: '#4f46e5' }),
          React.createElement('h3', { style: cardTitleStyle }, 'About Your Business')
        ),
        React.createElement('div', { style: cardBodyStyle },
          React.createElement('div', { style: { marginBottom: '20px' } },
            React.createElement('label', { style: { fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px', display: 'block' } }, 'Short Description'),
            isEditing ?
              React.createElement('textarea', {
                value: formData.description,
                onChange: function(e) { handleChange('description', e.target.value); },
                placeholder: 'Brief description of your business...',
                style: textareaStyle
              }) :
              React.createElement('p', { style: { fontSize: '14px', color: '#1e293b', lineHeight: '1.6', margin: 0 } }, formData.description || 'No description provided')
          ),
          React.createElement('div', { style: { marginBottom: '20px' } },
            React.createElement('label', { style: { fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px', display: 'block' } }, 'About Text'),
            isEditing ?
              React.createElement('textarea', {
                value: formData.about_text,
                onChange: function(e) { handleChange('about_text', e.target.value); },
                placeholder: 'Detailed information about your business...',
                style: { ...textareaStyle, minHeight: '150px' }
              }) :
              React.createElement('p', { style: { fontSize: '14px', color: '#1e293b', lineHeight: '1.6', margin: 0 } }, formData.about_text || 'No about text provided')
          )
        )
      )
    ),

    // Images Section - Full width
    React.createElement('div', { style: { ...cardStyle, marginTop: isDesktop ? '32px' : '20px' } },
      React.createElement('div', { style: cardHeaderStyle },
        React.createElement(Camera, { size: isDesktop ? 20 : 18, color: '#4f46e5' }),
        React.createElement('h3', { style: cardTitleStyle }, 'Business Images')
      ),
      React.createElement('div', { style: cardBodyStyle },
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr', gap: '24px' } },
          React.createElement(ImageUpload, {
            businessId: business.id,
            currentImage: formData.cover_image,
            type: 'cover',
            onUpload: function(url) { handleChange('cover_image', url); }
          }),
          React.createElement(ImageUpload, {
            businessId: business.id,
            currentImage: formData.logo_url,
            type: 'logo',
            onUpload: function(url) { handleChange('logo_url', url); }
          })
        ),
        React.createElement('div', { style: { marginTop: '24px' } },
          React.createElement(BusinessGallery, { businessId: business.id })
        )
      )
    )
  );
}

export default BusinessProfile;