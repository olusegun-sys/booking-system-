import { useState, useEffect } from 'react';
import { showSuccess, showError } from './toast';
import API_BASE from './config';

function StaffManagement({ business, onBack }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'staff'
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const roles = [
    { value: 'staff', label: 'Staff - Can view bookings only' },
    { value: 'manager', label: 'Manager - Can manage bookings and rooms' },
    { value: 'owner', label: 'Owner - Full access' }
  ];

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/businesses/${business.id}/staff`);
      const data = await response.json();
      if (data.success) setStaff(data.staff);
    } catch (err) {
      console.error('Failed to fetch staff');
      showError('Failed to load staff members');
    }
    setLoading(false);
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/businesses/${business.id}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setStaff([data.staff, ...staff]);
        setShowAddForm(false);
        setFormData({ email: '', password: '', full_name: '', role: 'staff' });
        showSuccess('Staff member added successfully');
      } else {
        setError(data.error || 'Failed to add staff');
        showError(data.error || 'Failed to add staff');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      showError('Something went wrong. Please try again.');
    }
    setSaving(false);
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/staff/${editingStaff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          role: formData.role,
          is_active: formData.is_active
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setStaff(staff.map(s => s.id === editingStaff.id ? data.staff : s));
        setEditingStaff(null);
        setFormData({ email: '', password: '', full_name: '', role: 'staff' });
        showSuccess('Staff member updated successfully');
      } else {
        setError(data.error || 'Failed to update staff');
        showError(data.error || 'Failed to update staff');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      showError('Something went wrong. Please try again.');
    }
    setSaving(false);
  };

  const handleDeleteStaff = async (staffId) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/staff/${staffId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        setStaff(staff.filter(s => s.id !== staffId));
        showSuccess('Staff member removed');
      } else {
        showError('Failed to remove staff');
      }
    } catch (err) {
      showError('Something went wrong. Please try again.');
    }
  };

  const startEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      email: staffMember.email,
      password: '',
      full_name: staffMember.full_name,
      role: staffMember.role,
      is_active: staffMember.is_active
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingStaff(null);
    setFormData({ email: '', password: '', full_name: '', role: 'staff' });
  };

  if (loading) {
    return React.createElement('div', { className: 'app-container' },
      React.createElement('div', { className: 'loading-spinner' })
    );
  }

  return React.createElement('div', { className: 'app-container' },
    React.createElement('div', { className: 'app-header' },
      React.createElement('h1', null, 'Staff Management - ', business.name),
      React.createElement('button', { className: 'btn btn-secondary', onClick: onBack }, 'Back to Dashboard')
    ),

    !showAddForm && !editingStaff && React.createElement('button', {
      className: 'btn btn-primary',
      onClick: () => setShowAddForm(true),
      style: { marginBottom: '24px' }
    }, '+ Add Staff Member'),

    (showAddForm || editingStaff) && React.createElement('div', { className: 'search-card', style: { marginBottom: '30px' } },
      React.createElement('h2', { style: { marginBottom: '24px' } }, editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'),
      
      error && React.createElement('div', { style: { background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' } }, error),

      React.createElement('form', { onSubmit: editingStaff ? handleUpdateStaff : handleAddStaff },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Full Name'),
          React.createElement('input', {
            type: 'text',
            required: true,
            value: formData.full_name,
            onChange: (e) => setFormData({...formData, full_name: e.target.value}),
            className: 'form-control',
            placeholder: 'John Doe'
          })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Email'),
          React.createElement('input', {
            type: 'email',
            required: true,
            disabled: !!editingStaff,
            value: formData.email,
            onChange: (e) => setFormData({...formData, email: e.target.value}),
            className: 'form-control',
            placeholder: 'staff@example.com'
          })
        ),
        !editingStaff && React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Password'),
          React.createElement('input', {
            type: 'password',
            required: !editingStaff,
            value: formData.password,
            onChange: (e) => setFormData({...formData, password: e.target.value}),
            className: 'form-control',
            placeholder: 'Enter password'
          })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Role'),
          React.createElement('select', {
            value: formData.role,
            onChange: (e) => setFormData({...formData, role: e.target.value}),
            className: 'form-control'
          }, roles.map(role => React.createElement('option', { key: role.value, value: role.value }, role.label)))
        ),
        editingStaff && React.createElement('div', { className: 'form-group' },
          React.createElement('label', null,
            React.createElement('input', {
              type: 'checkbox',
              checked: formData.is_active,
              onChange: (e) => setFormData({...formData, is_active: e.target.checked}),
              style: { marginRight: '8px' }
            }),
            'Active (can log in)'
          )
        ),
        React.createElement('div', { style: { display: 'flex', gap: '12px' } },
          React.createElement('button', { type: 'submit', disabled: saving, className: 'btn btn-success', style: { flex: 1 } }, saving ? 'Saving...' : (editingStaff ? 'Update Staff' : 'Add Staff')),
          React.createElement('button', { type: 'button', onClick: editingStaff ? cancelEdit : () => setShowAddForm(false), className: 'btn btn-secondary', style: { flex: 1 } }, 'Cancel')
        )
      )
    ),

    React.createElement('div', { className: 'dashboard-container' },
      React.createElement('h2', { style: { marginBottom: '24px' } }, 'Current Staff Members'),
      
      staff.length === 0 ? React.createElement('p', { style: { color: '#64748b', textAlign: 'center', padding: '40px' } }, 'No staff members added yet') :
      React.createElement('div', { style: { display: 'grid', gap: '15px' } },
        staff.map(member => React.createElement('div', { key: member.id, className: 'booking-card' },
          React.createElement('div', { className: 'booking-header' },
            React.createElement('div', null,
              React.createElement('h3', { style: { marginBottom: '5px' } }, member.full_name),
              React.createElement('p', { style: { color: '#64748b', fontSize: '14px' } }, member.email, ' - ', member.role)
            ),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
              React.createElement('span', { className: `status-badge ${member.is_active ? 'status-confirmed' : 'status-cancelled'}` }, member.is_active ? 'Active' : 'Inactive'),
              React.createElement('button', { className: 'btn btn-secondary', onClick: () => startEdit(member), style: { padding: '8px 16px' } }, 'Edit'),
              React.createElement('button', { className: 'btn btn-danger', onClick: () => handleDeleteStaff(member.id), style: { padding: '8px 16px' } }, 'Remove')
            )
          )
        ))
      )
    )
  );
}

export default StaffManagement;