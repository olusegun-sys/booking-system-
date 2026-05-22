import { useState } from 'react';
import { ArrowLeft, Plus, CheckCircle } from 'lucide-react';
import { showError, showSuccess } from './toast';
import API_BASE from './config';

function getTypeLabels(businessType) {
  if (businessType === 'hotel') return { item: 'Room', items: 'Rooms', priceLabel: 'Price Per Night (?)', placeholder: 'e.g., 25000' };
  if (businessType === 'sports') return { item: 'Court', items: 'Courts', priceLabel: 'Price Per Hour (?)', placeholder: 'e.g., 5000' };
  if (businessType === 'event') return { item: 'Space', items: 'Spaces', priceLabel: 'Price Per Event (?)', placeholder: 'e.g., 150000' };
  return { item: 'Room', items: 'Rooms', priceLabel: 'Price Per Night (?)', placeholder: 'e.g., 25000' };
}

function AddRoomForm({ businessId, businessType, onBack, onRoomAdded }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Standard', capacity: 2, price: '', description: '', amenities: '' });

  const labels = getTypeLabels(businessType);
  const roomTypes = businessType === 'sports' ? ['Hard Court', 'Clay Court', 'Grass Court', 'Football Pitch', 'Basketball Court']
    : businessType === 'event' ? ['Conference Hall', 'Banquet Hall', 'Outdoor Space', 'Meeting Room', 'Ballroom']
    : ['Standard', 'Deluxe', 'Premium', 'Suite', 'Executive'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.name.trim().length < 2) { showError(`Please enter a ${labels.item.toLowerCase()} name.`); return; }
    if (!formData.price || isNaN(formData.price) || formData.price <= 0) { showError('Please enter a valid price.'); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/businesses/${businessId}/rooms/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, type: formData.type, capacity: formData.capacity, price_per_night: parseFloat(formData.price), description: formData.description, amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()).filter(a => a) : [] })
      });
      const data = await response.json();
      if (data.success) { showSuccess(`${labels.item} added successfully!`); if (onRoomAdded) onRoomAdded(data.room); setFormData({ name: '', type: 'Standard', capacity: 2, price: '', description: '', amenities: '' }); }
      else { showError(data.error || `Failed to add ${labels.item.toLowerCase()}.`); }
    } catch (err) { showError('Something went wrong. Please try again.'); }
    setLoading(false);
  };

  return React.createElement('div', { className: 'app-container' },
    React.createElement('button', { onClick: onBack, className: 'btn btn-secondary', style: { marginBottom: '24px', padding: '10px 20px' } },
      React.createElement(ArrowLeft, { size: 16 }), ' Back to Dashboard'
    ),
    React.createElement('div', { style: { maxWidth: '560px', margin: '0 auto' } },
      React.createElement('div', { className: 'search-card' },
        React.createElement('h2', { style: { fontSize: '24px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' } },
          React.createElement(Plus, { size: 22, color: 'var(--primary)' }), ' Add New ', labels.item
        ),
        React.createElement('form', { onSubmit: handleSubmit },
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, labels.item, ' Name *'),
            React.createElement('input', {
              type: 'text',
              required: true,
              value: formData.name,
              onChange: (e) => setFormData({...formData, name: e.target.value}),
              className: 'form-control',
              placeholder: `e.g., ${businessType === 'sports' ? 'Court 1 - Hard Court' : businessType === 'event' ? 'Main Banquet Hall' : 'Standard Room'}`
            })
          ),
          React.createElement('div', { className: 'form-row', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', null, labels.item, ' Type'),
              React.createElement('select', {
                value: formData.type,
                onChange: (e) => setFormData({...formData, type: e.target.value}),
                className: 'form-control'
              }, roomTypes.map(type => React.createElement('option', { key: type, value: type }, type)))
            ),
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', null, 'Capacity ', businessType === 'event' ? '(guests)' : businessType === 'sports' ? '(players)' : '(guests)'),
              React.createElement('select', {
                value: formData.capacity,
                onChange: (e) => setFormData({...formData, capacity: parseInt(e.target.value)}),
                className: 'form-control'
              }, [1,2,3,4,5,6,8,10,15,20,30,50,100,200,300].map(num => React.createElement('option', { key: num, value: num }, num)))
            )
          ),
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, labels.priceLabel, ' *'),
            React.createElement('input', {
              type: 'number',
              required: true,
              value: formData.price,
              onChange: (e) => setFormData({...formData, price: e.target.value}),
              className: 'form-control',
              placeholder: labels.placeholder,
              min: "0"
            })
          ),
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Description'),
            React.createElement('textarea', {
              value: formData.description,
              onChange: (e) => setFormData({...formData, description: e.target.value}),
              className: 'form-control',
              placeholder: `Describe this ${labels.item.toLowerCase()}...`,
              rows: "3",
              style: { resize: 'vertical' }
            })
          ),
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Amenities (comma-separated)'),
            React.createElement('input', {
              type: 'text',
              value: formData.amenities,
              onChange: (e) => setFormData({...formData, amenities: e.target.value}),
              className: 'form-control',
              placeholder: 'WiFi, AC, TV, Mini Bar'
            }),
            React.createElement('p', { style: { fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px' } }, 'Separate each amenity with a comma')
          ),
          React.createElement('button', {
            type: 'submit',
            disabled: loading,
            className: 'btn btn-success',
            style: { width: '100%' }
          }, loading ? `Adding ${labels.item}...` : `Add ${labels.item}`)
        )
      )
    )
  );
}

export default AddRoomForm;