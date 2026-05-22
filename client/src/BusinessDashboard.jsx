﻿import React from 'react';
import { 
  Users, Settings, LogOut, Calendar, Building2, TrendingUp, Plus, 
  Image, Globe, Copy, ExternalLink, Trophy, Star, Edit3, Trash2, X, Save, 
  Zap, Home, Clock, Bed, Menu, LayoutDashboard, BookOpen, Briefcase, DollarSign,
  Loader2
} from 'lucide-react';
import useCountUp from './useCountUp';
import BusinessSettings from './BusinessSettings';
import StaffManagement from './StaffManagement';
import AddRoomForm from './AddRoomForm';
import BusinessProfile from './BusinessProfile';
import StatsCard from './components/ui/StatsCard';
import EmptyState from './components/ui/EmptyState';
import LoadingSkeleton from './components/ui/LoadingSkeleton';
import BookingCard from './components/ui/BookingCard';
import ConfirmModal from './components/ui/ConfirmModal';
import { showSuccess, showError } from './toast';
import API_BASE from './config';

var _useState = React.useState;
var _useEffect = React.useEffect;

function getBusinessLabels(type) {
  if (type === 'hotel') return { item: 'Room', items: 'Rooms', icon: Building2, addLabel: 'Add Room', noItemsMessage: 'No rooms added yet', noItemsDesc: 'Add your first room to start accepting bookings.' };
  if (type === 'sports') return { item: 'Court', items: 'Courts', icon: Trophy, addLabel: 'Add Court', noItemsMessage: 'No courts added yet', noItemsDesc: 'Add your first court to start accepting bookings.' };
  if (type === 'event') return { item: 'Space', items: 'Spaces', icon: Star, addLabel: 'Add Space', noItemsMessage: 'No event spaces added yet', noItemsDesc: 'Add your first event space to start accepting bookings.' };
  return { item: 'Room', items: 'Rooms', icon: Building2, addLabel: 'Add Room', noItemsMessage: 'Nothing added yet', noItemsDesc: 'Add your first item to start accepting bookings.' };
}

function BusinessDashboard(props) {
  var business = props.business;
  var onLogout = props.onLogout;

  var _useState2 = _useState([]);
  var bookings = _useState2[0];
  var setBookings = _useState2[1];
  var _useState3 = _useState([]);
  var rooms = _useState3[0];
  var setRooms = _useState3[1];
  var _useState4 = _useState('overview');
  var activeTab = _useState4[0];
  var setActiveTab = _useState4[1];
  var _useState5 = _useState(true);
  var loading = _useState5[0];
  var setLoading = _useState5[1];
  var _useState6 = _useState(false);
  var showSettings = _useState6[0];
  var setShowSettings = _useState6[1];
  var _useState7 = _useState(false);
  var showStaff = _useState7[0];
  var setShowStaff = _useState7[1];
  var _useState8 = _useState(false);
  var showAddRoom = _useState8[0];
  var setShowAddRoom = _useState8[1];
  var _useState9 = _useState(false);
  var showProfile = _useState9[0];
  var setShowProfile = _useState9[1];
  var _useState10 = _useState(business);
  var currentBusiness = _useState10[0];
  var setCurrentBusiness = _useState10[1];

  var _useState11 = _useState(null);
  var editingRoom = _useState11[0];
  var setEditingRoom = _useState11[1];
  var _useState12 = _useState({ name: '', type: 'Standard', capacity: 2, price_per_night: 0, description: '', amenities: '', status: 'available' });
  var editForm = _useState12[0];
  var setEditForm = _useState12[1];
  var _useState13 = _useState(false);
  var savingEdit = _useState13[0];
  var setSavingEdit = _useState13[1];
  var _useState14 = _useState(null);
  var deletingRoom = _useState14[0];
  var setDeletingRoom = _useState14[1];
  var _useState15 = _useState(false);
  var showMobileMenu = _useState15[0];
  var setShowMobileMenu = _useState15[1];
  
  var _useState16 = _useState(window.innerWidth >= 768);
  var isDesktop = _useState16[0];
  var setIsDesktop = _useState16[1];

  // Delete modal state
  var _useState17 = _useState({ isOpen: false, room: null });
  var deleteModal = _useState17[0];
  var setDeleteModal = _useState17[1];

  _useEffect(function() {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 768);
    }
    window.addEventListener('resize', handleResize);
    return function() { window.removeEventListener('resize', handleResize); };
  }, []);

  var labels = getBusinessLabels(currentBusiness.business_type);

  _useEffect(function () { fetchBookings(); fetchRooms(); }, []);

  function fetchBookings() {
    fetch(API_BASE + '/api/businesses/' + currentBusiness.id + '/bookings')
      .then(function (r) { return r.json(); })
      .then(function (data) { if (data.success) setBookings(data.bookings); })
      .catch(function () { showError('Failed to fetch bookings.'); });
  }

  function fetchRooms() {
    fetch(API_BASE + '/api/businesses/' + currentBusiness.id + '/rooms')
      .then(function (r) { return r.json(); })
      .then(function (data) { if (data.success) setRooms(data.rooms); })
      .catch(function () { showError('Failed to fetch ' + labels.items.toLowerCase() + '.'); })
      .finally(function () { setLoading(false); });
  }

  function refreshBusinessData() {
    fetch(API_BASE + '/api/businesses/' + currentBusiness.id)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success && data.business) {
          setCurrentBusiness(data.business);
          localStorage.setItem('currentBusiness', JSON.stringify(data.business));
        }
      })
      .catch(function () {});
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function handleEditRoom(room) {
    setEditingRoom(room);
    setEditForm({
      name: room.name || '',
      type: room.type || 'Standard',
      capacity: room.capacity || 2,
      price_per_night: room.price_per_night || 0,
      description: room.description || '',
      amenities: room.amenities ? room.amenities.join(', ') : '',
      status: room.status || 'available'
    });
  }

  function updateEditField(field, value) {
    setEditForm(function (prev) {
      var updated = {};
      for (var key in prev) updated[key] = prev[key];
      updated[field] = value;
      return updated;
    });
  }

  function handleSaveEdit() {
    if (!editForm.name || editForm.name.trim().length < 2) { showError('Room name is required.'); return; }
    if (!editForm.price_per_night || isNaN(editForm.price_per_night) || parseFloat(editForm.price_per_night) <= 0) { showError('A valid price is required.'); return; }
    setSavingEdit(true);
    var payload = {
      name: editForm.name.trim(),
      type: editForm.type,
      capacity: parseInt(editForm.capacity) || 2,
      price_per_night: parseFloat(editForm.price_per_night),
      description: editForm.description || '',
      amenities: editForm.amenities ? editForm.amenities.split(',').map(function (a) { return a.trim(); }).filter(function (a) { return a; }) : [],
      status: editForm.status
    };
    fetch(API_BASE + '/api/businesses/' + currentBusiness.id + '/rooms/' + editingRoom.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          showSuccess(labels.item + ' updated!');
          setEditingRoom(null);
          fetchRooms();
        } else {
          showError(data.error || 'Failed to update ' + labels.item.toLowerCase() + '.');
        }
      })
      .catch(function () { showError('Something went wrong. Please try again.'); })
      .finally(function () { setSavingEdit(false); });
  }

  function handleDeleteClick(room) {
    setDeleteModal({ isOpen: true, room: room });
  }

  function handleConfirmDelete() {
    var room = deleteModal.room;
    if (!room) return;
    
    setDeletingRoom(room.id);
    setDeleteModal({ isOpen: false, room: null });
    
    fetch(API_BASE + '/api/businesses/' + currentBusiness.id + '/rooms/' + room.id, { method: 'DELETE' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success || data.message) { 
          showSuccess(labels.item + ' deleted.'); 
          fetchRooms(); 
        } else { 
          showError(data.error || 'Failed to delete.'); 
        }
      })
      .catch(function () { showError('Something went wrong. Please try again.'); })
      .finally(function () { setDeletingRoom(null); });
  }

  function handleCancelDelete() {
    setDeleteModal({ isOpen: false, room: null });
  }

  var totalRevenue = bookings.filter(function (b) { return b.status === 'confirmed'; }).reduce(function (sum, b) { return sum + parseFloat(b.total_amount); }, 0);
  var confirmedBookings = bookings.filter(function (b) { return b.status === 'confirmed'; }).length;
  var availableRooms = rooms.filter(function (r) { return r.status === 'available'; }).length;
  var bookingLink = window.location.origin + '/book/' + currentBusiness.slug;

  if (showStaff) return React.createElement(StaffManagement, { business: currentBusiness, onBack: function () { setShowStaff(false); } });
  if (showSettings) return React.createElement(BusinessSettings, { business: currentBusiness, onBack: function () { setShowSettings(false); refreshBusinessData(); }, onBusinessUpdate: function () { refreshBusinessData(); } });
  if (showAddRoom) return React.createElement(AddRoomForm, { businessId: currentBusiness.id, businessType: currentBusiness.business_type, onBack: function () { setShowAddRoom(false); }, onRoomAdded: function () { setShowAddRoom(false); fetchRooms(); } });
  if (showProfile) return React.createElement(BusinessProfile, { business: currentBusiness, onBack: function () { setShowProfile(false); }, onUpdate: function () { setShowProfile(false); refreshBusinessData(); } });
  if (loading) return React.createElement(LoadingSkeleton, { type: 'dashboard', count: 3 });

  var compactStats = [
    { icon: TrendingUp, value: formatPrice(totalRevenue), label: 'Revenue', color: '#10b981' },
    { icon: Calendar, value: confirmedBookings, label: 'Bookings', color: '#3b82f6' },
    { icon: labels.icon, value: availableRooms, label: labels.items, color: '#8b5cf6' }
  ];

  var tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'rooms', label: labels.items, icon: labels.icon },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: Building2 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  var containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f5f7fb'
  };

  var headerStyle = {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100
  };

  var headerContentStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: isDesktop ? '16px 32px' : '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  var mainStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: isDesktop ? '32px' : '16px 16px 80px'
  };

  var statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
    gap: isDesktop ? '24px' : '12px',
    marginBottom: isDesktop ? '32px' : '20px'
  };

  var usageCardStyle = {
    background: confirmedBookings >= 45 ? '#fef3c7' : 'white',
    borderRadius: isDesktop ? '20px' : '16px',
    padding: isDesktop ? '20px 24px' : '14px 16px',
    marginBottom: isDesktop ? '32px' : '20px',
    border: '1px solid #e2e8f0'
  };

  var actionsGridStyle = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
    gap: isDesktop ? '16px' : '12px',
    marginBottom: isDesktop ? '32px' : '20px'
  };

  var roomsGridStyle = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr',
    gap: isDesktop ? '20px' : '12px'
  };

  var bookingsGridStyle = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(380px, 1fr))' : '1fr',
    gap: isDesktop ? '20px' : '12px'
  };

  return React.createElement('div', { style: containerStyle },
    React.createElement('header', { style: headerStyle },
      React.createElement('div', { style: headerContentStyle },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: isDesktop ? '16px' : '10px' } },
          currentBusiness.logo_url ? 
            React.createElement('img', { src: currentBusiness.logo_url, alt: currentBusiness.name, style: { width: isDesktop ? '48px' : '36px', height: isDesktop ? '48px' : '36px', borderRadius: '12px', objectFit: 'cover' } }) :
            React.createElement(Building2, { size: isDesktop ? 32 : 28, color: '#4f46e5' }),
          React.createElement('div', null,
            React.createElement('h1', { style: { fontSize: isDesktop ? '20px' : '16px', fontWeight: '700', color: '#0f172a', margin: 0 } }, currentBusiness.name),
            React.createElement('p', { style: { fontSize: isDesktop ? '13px' : '11px', color: '#64748b', margin: 0 } }, currentBusiness.business_type)
          )
        ),
        React.createElement('div', { style: { display: 'flex', gap: isDesktop ? '16px' : '8px', alignItems: 'center' } },
          isDesktop && React.createElement('div', { style: { display: 'flex', gap: '12px' } },
            React.createElement('button', { 
              onClick: function () { setShowStaff(true); }, 
              style: { padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }
            }, React.createElement(Users, { size: 16 }), ' Staff'),
            React.createElement('button', { 
              onClick: onLogout, 
              style: { padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }
            }, React.createElement(LogOut, { size: 16 }), ' Logout')
          ),
          !isDesktop && React.createElement('button', {
            onClick: function () { setShowMobileMenu(!showMobileMenu); },
            style: { 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer'
            }
          }, React.createElement(Menu, { size: 20, color: '#475569' }))
        )
      )
    ),

    !isDesktop && showMobileMenu && React.createElement('div', { style: { 
      position: 'absolute',
      top: '64px',
      right: '16px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      padding: '8px',
      zIndex: 101,
      minWidth: '140px'
    } },
      React.createElement('button', {
        onClick: function () { setShowStaff(true); setShowMobileMenu(false); },
        style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '8px' }
      }, React.createElement(Users, { size: 16 }), ' Staff'),
      React.createElement('button', {
        onClick: onLogout,
        style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '8px', color: '#dc2626' }
      }, React.createElement(LogOut, { size: 16 }), ' Logout')
    ),

    isDesktop && React.createElement('div', { style: { 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: '0 32px',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: 'white'
    } },
      React.createElement('div', { style: { 
        display: 'flex', 
        gap: '4px',
        overflowX: 'auto'
      } },
        tabs.map(function(tab) {
          var isActive = activeTab === tab.id;
          return React.createElement('button', { 
            key: tab.id,
            style: { 
              padding: '14px 24px',
              border: 'none',
              background: 'transparent',
              fontSize: '14px',
              fontWeight: '600',
              color: isActive ? '#4f46e5' : '#64748b',
              cursor: 'pointer',
              borderBottom: isActive ? '2px solid #4f46e5' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            },
            onClick: function () { setActiveTab(tab.id); }
          }, React.createElement(tab.icon, { size: 16 }), tab.label);
        })
      )
    ),

    !isDesktop && React.createElement('div', { style: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '8px 16px 12px',
      zIndex: 100
    } },
      tabs.map(function(tab) {
        var isActive = activeTab === tab.id;
        return React.createElement('button', {
          key: tab.id,
          onClick: function () { setActiveTab(tab.id); },
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 12px',
            borderRadius: '8px',
            color: isActive ? '#4f46e5' : '#94a3b8'
          }
        }, React.createElement(tab.icon, { size: 20 }), React.createElement('span', { style: { fontSize: '11px', fontWeight: isActive ? '600' : '400' } }, tab.label));
      })
    ),

    React.createElement('main', { style: mainStyle },

      activeTab === 'overview' && React.createElement('div', null,
        React.createElement('div', { style: statsGridStyle },
          compactStats.map(function(stat, idx) {
            return React.createElement('div', { key: idx, style: {
              background: 'white',
              padding: isDesktop ? '24px 16px' : '14px 8px',
              borderRadius: isDesktop ? '20px' : '16px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0'
            } },
              React.createElement(stat.icon, { size: isDesktop ? 28 : 20, color: stat.color, style: { marginBottom: isDesktop ? '12px' : '6px' } }),
              React.createElement('div', { style: { fontSize: isDesktop ? '28px' : '18px', fontWeight: '800', color: '#0f172a' } }, stat.value),
              React.createElement('div', { style: { fontSize: isDesktop ? '13px' : '11px', color: '#64748b' } }, stat.label)
            );
          })
        ),

        React.createElement('div', { style: usageCardStyle },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isDesktop ? '12px' : '8px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: isDesktop ? '12px' : '8px' } },
              React.createElement(Zap, { size: isDesktop ? 20 : 16, color: '#f59e0b' }),
              React.createElement('span', { style: { fontSize: isDesktop ? '14px' : '13px', fontWeight: '600' } }, 'Free Tier Usage')
            ),
            React.createElement('span', { style: { fontSize: isDesktop ? '14px' : '12px', fontWeight: '600', color: '#475569' } }, confirmedBookings + '/50')
          ),
          React.createElement('div', { style: { height: isDesktop ? '8px' : '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' } },
            React.createElement('div', { style: {
              height: '100%',
              width: Math.min((confirmedBookings / 50) * 100, 100) + '%',
              background: confirmedBookings >= 45 ? '#f59e0b' : '#4f46e5',
              borderRadius: '4px'
            } })
          ),
          isDesktop && React.createElement('p', { style: { fontSize: '12px', color: '#64748b', marginTop: '12px' } }, 
            confirmedBookings >= 45 ? 'Almost at limit. Consider upgrading.' : 'First 50 bookings free. Upgrade to a paid plan after.'
          )
        ),

        React.createElement('div', { style: actionsGridStyle },
          React.createElement('button', {
            onClick: function () { setActiveTab('rooms'); setShowAddRoom(true); },
            style: { background: 'white', padding: isDesktop ? '20px' : '14px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', cursor: 'pointer' }
          }, React.createElement(Plus, { size: isDesktop ? 28 : 22, color: '#4f46e5', style: { marginBottom: isDesktop ? '12px' : '6px' } }), React.createElement('div', { style: { fontSize: isDesktop ? '14px' : '13px', fontWeight: '600' } }, 'Add ' + labels.item)),
          React.createElement('button', {
            onClick: function () { setShowProfile(true); },
            style: { background: 'white', padding: isDesktop ? '20px' : '14px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', cursor: 'pointer' }
          }, React.createElement(Image, { size: isDesktop ? 28 : 22, color: '#4f46e5', style: { marginBottom: isDesktop ? '12px' : '6px' } }), React.createElement('div', { style: { fontSize: isDesktop ? '14px' : '13px', fontWeight: '600' } }, 'Update Images')),
          React.createElement('button', {
            onClick: function () { setShowSettings(true); },
            style: { background: 'white', padding: isDesktop ? '20px' : '14px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', cursor: 'pointer' }
          }, React.createElement(Clock, { size: isDesktop ? 28 : 22, color: '#4f46e5', style: { marginBottom: isDesktop ? '12px' : '6px' } }), React.createElement('div', { style: { fontSize: isDesktop ? '14px' : '13px', fontWeight: '600' } }, 'Set Hours')),
          React.createElement('button', {
            onClick: function () { window.open(bookingLink, '_blank'); },
            style: { background: 'white', padding: isDesktop ? '20px' : '14px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', cursor: 'pointer' }
          }, React.createElement(ExternalLink, { size: isDesktop ? 28 : 22, color: '#4f46e5', style: { marginBottom: isDesktop ? '12px' : '6px' } }), React.createElement('div', { style: { fontSize: isDesktop ? '14px' : '13px', fontWeight: '600' } }, 'View Page'))
        ),

        bookings.length > 0 && React.createElement('div', null,
          React.createElement('h3', { style: { fontSize: isDesktop ? '18px' : '14px', fontWeight: '600', color: '#1e293b', marginBottom: isDesktop ? '20px' : '12px' } }, 'Recent Bookings'),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: isDesktop ? '12px' : '8px' } },
            bookings.slice(0, isDesktop ? 5 : 3).map(function(booking) {
              return React.createElement('div', { key: booking.id, style: { background: 'white', padding: isDesktop ? '16px' : '12px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                React.createElement('div', null,
                  React.createElement('div', { style: { fontSize: isDesktop ? '15px' : '14px', fontWeight: '600' } }, booking.customer_name),
                  React.createElement('div', { style: { fontSize: isDesktop ? '12px' : '11px', color: '#64748b' } }, formatDate(booking.created_at))
                ),
                React.createElement('div', null,
                  React.createElement('div', { style: { fontSize: isDesktop ? '16px' : '14px', fontWeight: '700', color: '#10b981', textAlign: 'right' } }, formatPrice(booking.total_amount)),
                  React.createElement('div', { style: { fontSize: isDesktop ? '11px' : '10px', color: '#64748b' } }, booking.status)
                )
              );
            })
          )
        )
      ),

      activeTab === 'rooms' && React.createElement('div', null,
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isDesktop ? '24px' : '16px', flexWrap: 'wrap', gap: '12px' } },
          React.createElement('h2', { style: { fontSize: isDesktop ? '24px' : '18px', fontWeight: '700', color: '#0f172a' } }, 'Your ' + labels.items),
          React.createElement('button', {
            onClick: function () { setShowAddRoom(true); },
            style: { padding: isDesktop ? '12px 24px' : '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: isDesktop ? '12px' : '10px', fontSize: isDesktop ? '14px' : '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }
          }, React.createElement(Plus, { size: isDesktop ? 18 : 14 }), ' Add ' + labels.item)
        ),
        rooms.length === 0 ?
          React.createElement(EmptyState, { icon: labels.icon, title: labels.noItemsMessage, message: labels.noItemsDesc, action: true, actionLabel: labels.addLabel, onAction: function () { setShowAddRoom(true); } }) :
          React.createElement('div', { style: roomsGridStyle },
            rooms.map(function(room) {
              return React.createElement('div', { key: room.id, style: { background: 'white', borderRadius: '16px', padding: isDesktop ? '20px' : '14px', border: '1px solid #e2e8f0' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isDesktop ? '12px' : '8px' } },
                  React.createElement('div', null,
                    React.createElement('h3', { style: { fontSize: isDesktop ? '18px' : '16px', fontWeight: '700' } }, room.name),
                    React.createElement('span', { style: { fontSize: isDesktop ? '12px' : '11px', color: '#64748b' } }, room.type)
                  ),
                  React.createElement('span', { style: { fontSize: isDesktop ? '20px' : '18px', fontWeight: '800', color: '#4f46e5' } }, formatPrice(room.price_per_night))
                ),
                isDesktop && room.description && React.createElement('p', { style: { fontSize: '13px', color: '#64748b', marginBottom: '12px' } }, room.description.substring(0, 100)),
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: isDesktop ? '12px' : '8px' } },
                  React.createElement('span', { style: { fontSize: isDesktop ? '13px' : '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' } }, React.createElement(Bed, { size: isDesktop ? 14 : 12 }), room.capacity, ' guests'),
                  React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                    React.createElement('button', { 
                      onClick: function () { handleEditRoom(room); }, 
                      style: { padding: isDesktop ? '6px 16px' : '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: isDesktop ? '13px' : '12px' } 
                    }, savingEdit === room.id ? React.createElement(Loader2, { size: 12, style: { animation: 'spin 1s linear infinite' } }) : 'Edit'),
                    React.createElement('button', { 
                      onClick: function () { handleDeleteClick(room); }, 
                      style: { padding: isDesktop ? '6px 16px' : '6px 12px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: isDesktop ? '13px' : '12px' } 
                    }, deletingRoom === room.id ? React.createElement(Loader2, { size: 12, style: { animation: 'spin 1s linear infinite' } }) : 'Delete')
                  )
                ),
                room.amenities && room.amenities.length > 0 && !isDesktop && React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '12px' } },
                  room.amenities.slice(0, 3).map(function(amenity, idx) {
                    return React.createElement('span', { key: idx, style: { background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', color: '#64748b' } }, amenity);
                  })
                )
              );
            })
          )
      ),

      activeTab === 'bookings' && React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: isDesktop ? '24px' : '18px', fontWeight: '700', color: '#0f172a', marginBottom: isDesktop ? '24px' : '16px' } }, 'All Bookings'),
        bookings.length === 0 ?
          React.createElement(EmptyState, { icon: Calendar, title: 'No bookings yet', message: "When customers book, they'll appear here.", action: true, actionLabel: 'View Booking Page', onAction: function () { window.open(bookingLink, '_blank'); } }) :
          React.createElement('div', { style: bookingsGridStyle },
            bookings.map(function(booking) {
              return React.createElement(BookingCard, { key: booking.id, booking: booking, formatPrice: formatPrice, formatDate: formatDate });
            })
          )
      ),

      activeTab === 'profile' && React.createElement(BusinessProfile, { business: currentBusiness, onBack: function () { setActiveTab('overview'); }, onUpdate: function () { refreshBusinessData(); } }),

      activeTab === 'settings' && React.createElement(BusinessSettings, { business: currentBusiness, onBack: function () { setActiveTab('overview'); }, onBusinessUpdate: function () { refreshBusinessData(); } })
    ),

    React.createElement(ConfirmModal, {
      isOpen: deleteModal.isOpen,
      title: 'Delete ' + labels.item,
      message: 'Are you sure you want to permanently delete "' + (deleteModal.room?.name || '') + '"?\n\nThis action cannot be undone. All associated data will be permanently removed.',
      confirmLabel: 'Delete Permanently',
      cancelLabel: 'Cancel',
      onConfirm: handleConfirmDelete,
      onCancel: handleCancelDelete,
      isDanger: true,
      loading: deletingRoom !== null
    }),

    editingRoom && React.createElement('div', { style: { 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', 
      justifyContent: 'center', zIndex: 1000, padding: '20px' 
    }, onClick: function () { setEditingRoom(null); } },
      React.createElement('div', { style: { 
        background: 'white', borderRadius: '20px', 
        maxWidth: isDesktop ? '500px' : '95%', width: '100%', 
        padding: isDesktop ? '28px' : '24px', 
        maxHeight: '90vh', overflowY: 'auto' 
      }, onClick: function (e) { e.stopPropagation(); } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
          React.createElement('h2', { style: { fontSize: isDesktop ? '20px' : '18px', fontWeight: '700' } }, 'Edit ' + labels.item),
          React.createElement('button', { onClick: function () { setEditingRoom(null); }, style: { width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#f1f5f9', cursor: 'pointer' } }, React.createElement(X, { size: 16 }))
        ),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
          React.createElement('input', { type: 'text', placeholder: 'Name', value: editForm.name, onChange: function (e) { updateEditField('name', e.target.value); }, style: { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' } }),
          React.createElement('select', { value: editForm.type, onChange: function (e) { updateEditField('type', e.target.value); }, style: { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' } },
            React.createElement('option', { value: 'Standard' }, 'Standard'),
            React.createElement('option', { value: 'Deluxe' }, 'Deluxe'),
            React.createElement('option', { value: 'Executive' }, 'Executive'),
            React.createElement('option', { value: 'Suite' }, 'Suite')
          ),
          React.createElement('input', { type: 'number', placeholder: 'Price per night (₦)', value: editForm.price_per_night, onChange: function (e) { updateEditField('price_per_night', e.target.value); }, style: { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' } }),
          React.createElement('textarea', { placeholder: 'Description', value: editForm.description, onChange: function (e) { updateEditField('description', e.target.value); }, rows: isDesktop ? 3 : 2, style: { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' } })
        ),
        React.createElement('div', { style: { display: 'flex', gap: '12px', marginTop: '20px' } },
          React.createElement('button', { onClick: function () { setEditingRoom(null); }, style: { flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' } }, 'Cancel'),
          React.createElement('button', { onClick: handleSaveEdit, disabled: savingEdit, style: { flex: 1, padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: savingEdit ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' } }, 
            savingEdit ? React.createElement(Loader2, { size: 16, style: { animation: 'spin 1s linear infinite' } }) : React.createElement(Save, { size: 16 }), 
            savingEdit ? 'Saving...' : 'Save'
          )
        )
      )
    )
  );
}

export default BusinessDashboard;