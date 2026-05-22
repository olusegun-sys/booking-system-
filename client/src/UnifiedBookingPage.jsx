﻿import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Phone, Mail, Clock, DollarSign, 
  Trophy, Users, Star, Building2, Wind, Car, X, 
  ChevronLeft, ChevronRight, Wifi, Coffee, Tv, Bath, Calendar, Home,
  CheckCircle, Download, Printer, CreditCard
} from 'lucide-react';
import RoomPage from './RoomPage';
import SportsBooking from './SportsBooking';
import EventBooking from './EventBooking';

// Dynamic API base - works on desktop and mobile
var API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'http://' + window.location.hostname + ':5000';

var sportsImages = [
  'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1533563906091-fdfdffc3e3c2?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200&h=400&fit=crop'
];

var eventImages = [
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200&h=400&fit=crop'
];

var defaultHotelHero = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop';

function getRoomImage(roomName) {
  var name = roomName.toLowerCase();
  if (name.includes('suite')) return 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop';
  if (name.includes('king') || name.includes('executive')) return 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop';
  if (name.includes('family')) return 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=400&fit=crop';
  if (name.includes('deluxe')) return 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop';
  return 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop';
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price || 0);
}

function UnifiedBookingPage() {
  var _useParams = useParams();
  var businessSlug = _useParams.businessSlug;
  var navigate = useNavigate();
  var _useState = React.useState(null);
  var business = _useState[0];
  var setBusiness = _useState[1];
  var _useState2 = React.useState([]);
  var rooms = _useState2[0];
  var setRooms = _useState2[1];
  var _useState3 = React.useState([]);
  var galleryImages = _useState3[0];
  var setGalleryImages = _useState3[1];
  var _useState4 = React.useState(true);
  var loading = _useState4[0];
  var setLoading = _useState4[1];
  var _useState5 = React.useState('');
  var error = _useState5[0];
  var setError = _useState5[1];
  var _useState6 = React.useState(false);
  var bookingStarted = _useState6[0];
  var setBookingStarted = _useState6[1];
  var _useState7 = React.useState(Math.floor(Math.random() * 3));
  var imageIndex = _useState7[0];
  var _useState8 = React.useState(false);
  var lightboxOpen = _useState8[0];
  var setLightboxOpen = _useState8[1];
  var _useState9 = React.useState(0);
  var lightboxIndex = _useState9[0];
  var setLightboxIndex = _useState9[1];
  var _useState10 = React.useState({ checkIn: '', checkOut: '' });
  var dateRange = _useState10[0];
  var setDateRange = _useState10[1];
  var _useState11 = React.useState(1);
  var guests = _useState11[0];
  var setGuests = _useState11[1];
  var _useState12 = React.useState(false);
  var showGuestPicker = _useState12[0];
  var setShowGuestPicker = _useState12[1];
  var _useState13 = React.useState(null);
  var selectedRoom = _useState13[0];
  var setSelectedRoom = _useState13[1];
  var _useState14 = React.useState(false);
  var showBookingForm = _useState14[0];
  var setShowBookingForm = _useState14[1];
  var _useState15 = React.useState(false);
  var expandedStory = _useState15[0];
  var setExpandedStory = _useState15[1];

  React.useEffect(function () { 
    fetchBusinessData(); 
  }, [businessSlug]);

  React.useEffect(function () {
    if (!lightboxOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') { closeLightbox(); return; }
      if (e.key === 'ArrowLeft') { goToPrev(); return; }
      if (e.key === 'ArrowRight') { goToNext(); return; }
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return function () {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, lightboxIndex, galleryImages.length]);

  function fetchBusinessData() {
    setLoading(true);
    fetch(API_BASE + '/api/businesses/slug/' + businessSlug)
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data.success && data.business) {
          setBusiness(data.business);
          return fetch(API_BASE + '/api/businesses/' + data.business.id + '/rooms')
            .then(function (r) { return r.json(); })
            .then(function (roomsData) {
              if (roomsData.success) setRooms(roomsData.rooms || []);
              return fetch(API_BASE + '/api/businesses/' + data.business.id + '/gallery')
                .then(function (r) { return r.json(); })
                .then(function (galleryData) {
                  if (galleryData && galleryData.images) setGalleryImages(galleryData.images);
                  setLoading(false);
                });
            });
        } else {
          setError('Business not found');
          setLoading(false);
        }
      })
      .catch(function (err) {
        console.error('Fetch error:', err);
        setError('Could not load business');
        setLoading(false);
      });
  }

  function openLightbox(index) { setLightboxIndex(index); setLightboxOpen(true); }
  function closeLightbox() { setLightboxOpen(false); }
  function goToPrev() { setLightboxIndex(function (prev) { return prev === 0 ? galleryImages.length - 1 : prev - 1; }); }
  function goToNext() { setLightboxIndex(function (prev) { return prev === galleryImages.length - 1 ? 0 : prev + 1; }); }

  function handleBookNow(room) {
    if (!dateRange.checkIn || !dateRange.checkOut) {
      alert('Please select check-in and check-out dates first');
      return;
    }
    setSelectedRoom(room);
    setShowBookingForm(true);
  }

  function getHeroImage() {
    if (business && business.cover_image) return business.cover_image;
    if (business && business.business_type === 'hotel') return defaultHotelHero;
    if (business && business.business_type === 'sports') return sportsImages[imageIndex];
    if (business && business.business_type === 'event') return eventImages[imageIndex];
    return defaultHotelHero;
  }

  if (loading) {
    return React.createElement('div', { className: 'app-container', style: { textAlign: 'center', padding: '3rem' } },
      React.createElement('div', { className: 'loading-spinner' }),
      React.createElement('p', { style: { marginTop: '1rem', color: '#64748b' } }, 'Loading...')
    );
  }

  if (error || !business) {
    return React.createElement('div', { className: 'app-container' },
      React.createElement('div', { className: 'empty-state' },
        React.createElement(MapPin, { size: 48, strokeWidth: 1.5, color: '#94a3b8', style: { marginBottom: '1rem' } }),
        React.createElement('h3', null, 'Business not found'),
        React.createElement('p', null, error || "The page you're looking for doesn't exist."),
        React.createElement('button', { className: 'btn btn-primary', onClick: function () { navigate('/'); } }, 'Go Home')
      )
    );
  }

  if (bookingStarted) {
    if (business.business_type === 'hotel') {
      return React.createElement(RoomPage, { 
        businessId: business.id, 
        businessName: business.name, 
        businessType: business.business_type, 
        onBack: function () { navigate('/'); } 
      });
    }
    if (business.business_type === 'sports') {
      return React.createElement(SportsBooking, { 
        business: business, 
        onBack: function () { setBookingStarted(false); } 
      });
    }
    if (business.business_type === 'event') {
      return React.createElement(EventBooking, { 
        business: business, 
        onBack: function () { setBookingStarted(false); } 
      });
    }
  }

  var availableRooms = rooms.filter(function (r) { return r.status === 'available'; });
  var badgeType = business.business_type === 'hotel' ? 'Hotel' : business.business_type === 'sports' ? 'Sports Facility' : 'Event Venue';
  var badgeColor = business.business_type === 'hotel' ? '#4f46e5' : business.business_type === 'sports' ? '#059669' : '#d97706';

  return React.createElement('div', { style: { background: '#f5f7fb', minHeight: '100vh' } },

    // Header
    React.createElement('div', { className: 'app-header' },
      React.createElement('div', null,
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' } },
          business.logo_url && React.createElement('img', { 
            src: business.logo_url, 
            alt: business.name, 
            style: { width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', background: 'white', padding: '0.25rem' } 
          }),
          React.createElement('div', null,
            React.createElement('h1', { style: { margin: 0, fontSize: '1.25rem' } }, business.name),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' } },
              React.createElement('span', { 
                style: { 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.25rem', 
                  background: badgeColor + '15', 
                  color: badgeColor, 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '9999px', 
                  fontSize: '0.7rem', 
                  fontWeight: '600' 
                } 
              }, badgeType),
              React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b', fontSize: '0.7rem' } },
                React.createElement(MapPin, { size: 12 }), business.city + ', ' + business.state
              )
            )
          )
        )
      ),
      React.createElement('button', { 
        className: 'btn btn-secondary', 
        onClick: function () { navigate('/'); }, 
        style: { whiteSpace: 'nowrap' } 
      },
        React.createElement(ArrowLeft, { size: 16 }), ' Back'
      )
    ),

    // Hero Section
    React.createElement('div', { className: 'hero-section' },
      React.createElement('div', { 
        className: 'hero-background', 
        style: { backgroundImage: 'url(' + getHeroImage() + ')' } 
      }),
      React.createElement('div', { className: 'hero-overlay' }),
      React.createElement('div', { className: 'hero-content' },
        business.logo_url && React.createElement('img', { 
          src: business.logo_url, 
          alt: business.name, 
          className: 'hero-logo' 
        }),
        React.createElement('h1', { className: 'hero-title' }, business.name),
        React.createElement('div', { style: { display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' } },
          React.createElement('span', { 
            style: { 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.25rem', 
              background: 'rgba(0,0,0,0.4)', 
              backdropFilter: 'blur(8px)', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '9999px', 
              fontSize: '0.7rem', 
              color: 'white' 
            } 
          },
            React.createElement(MapPin, { size: 12 }), business.city + ', ' + business.state
          ),
          React.createElement('span', { 
            style: { 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.25rem', 
              background: 'rgba(0,0,0,0.4)', 
              backdropFilter: 'blur(8px)', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '9999px', 
              fontSize: '0.7rem', 
              color: 'white' 
            } 
          },
            React.createElement(Star, { size: 12, fill: '#fbbf24', color: '#fbbf24' }), '4.8 · Premium Host'
          )
        ),
        React.createElement('p', { 
          className: 'hero-description',
          style: { color: 'white' }
        }, 
          (business.description || business.about_text || 'Experience luxury and comfort in the heart of the city')
        )
      )
    ),

    // Floating Date Picker
    business.business_type === 'hotel' && React.createElement('div', { className: 'floating-picker' },
      React.createElement('div', { className: 'picker-container' },
        React.createElement('div', { className: 'picker-group' },
          React.createElement('span', { className: 'picker-label' }, 'CHECK-IN'),
          React.createElement('input', { 
            type: 'date', 
            value: dateRange.checkIn, 
            onChange: function (e) { setDateRange({ ...dateRange, checkIn: e.target.value }); }, 
            className: 'picker-input' 
          })
        ),
        React.createElement('div', { className: 'picker-group' },
          React.createElement('span', { className: 'picker-label' }, 'CHECK-OUT'),
          React.createElement('input', { 
            type: 'date', 
            value: dateRange.checkOut, 
            onChange: function (e) { setDateRange({ ...dateRange, checkOut: e.target.value }); }, 
            className: 'picker-input' 
          })
        ),
        React.createElement('div', { className: 'picker-group', style: { position: 'relative' } },
          React.createElement('span', { className: 'picker-label' }, 'GUESTS'),
          React.createElement('button', { 
            onClick: function () { setShowGuestPicker(!showGuestPicker); }, 
            style: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', padding: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.25rem' } 
          },
            React.createElement(Users, { size: 14 }), guests + ' guest' + (guests > 1 ? 's' : '')
          ),
          showGuestPicker && React.createElement('div', { 
            style: { 
              position: 'absolute', 
              top: '100%', 
              left: 0, 
              marginTop: '0.5rem', 
              background: 'white', 
              borderRadius: '0.75rem', 
              padding: '0.75rem', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)', 
              minWidth: '140px', 
              zIndex: 10 
            } 
          },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' } },
              React.createElement('button', { 
                onClick: function () { setGuests(Math.max(1, guests - 1)); }, 
                style: { width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' } 
              }, '-'),
              React.createElement('span', { style: { fontWeight: '600' } }, guests),
              React.createElement('button', { 
                onClick: function () { setGuests(Math.min(20, guests + 1)); }, 
                style: { width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' } 
              }, '+')
            ),
            React.createElement('button', { 
              onClick: function () { setShowGuestPicker(false); }, 
              style: { marginTop: '0.75rem', width: '100%', padding: '0.5rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' } 
            }, 'Done')
          )
        )
      )
    ),

    // Main Content
    React.createElement('div', { className: 'app-container' },

      // Story Section
      (business.about_text || business.description) && React.createElement('div', { className: 'hotel-card', style: { marginBottom: '1.5rem' } },
        React.createElement('h2', null, business.about_text ? 'Our Story' : 'About ' + business.name),
        React.createElement('p', { style: { color: '#64748b', lineHeight: '1.6', marginBottom: '0.75rem', fontSize: '0.875rem' } },
          expandedStory 
            ? (business.about_text || business.description) 
            : (business.about_text || business.description || '').substring(0, 200) + ((business.about_text || business.description || '').length > 200 ? '...' : '')
        ),
        (business.about_text || business.description || '').length > 200 && React.createElement('button', {
          onClick: function () { setExpandedStory(!expandedStory); },
          style: { background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }
        }, expandedStory ? 'Show less' : 'Read more')
      ),

      // Gallery Section
      galleryImages.length > 0 && React.createElement('div', { style: { marginBottom: '2rem' } },
        React.createElement('h2', null, 'Photo Gallery'),
        React.createElement('div', { className: 'booking-gallery-grid' },
          galleryImages.map(function (img, i) {
            return React.createElement('div', { 
              key: img.id, 
              className: 'booking-gallery-item', 
              onClick: function () { openLightbox(i); } 
            },
              React.createElement('img', { 
                src: img.image_url, 
                alt: img.file_name || 'Gallery ' + (i + 1), 
                className: 'booking-gallery-image', 
                loading: 'lazy' 
              })
            );
          })
        )
      ),

      // Rooms Section
      business.business_type === 'hotel' && React.createElement('div', null,
        React.createElement('h2', null, 'Available Rooms'),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '1.5rem' } },
          availableRooms.length === 0 && React.createElement('div', { className: 'empty-state', style: { textAlign: 'center', padding: '3rem' } },
            React.createElement('p', null, 'No rooms available at the moment.')
          ),
          availableRooms.map(function (room) {
            return React.createElement('div', { 
              key: room.id, 
              style: { 
                background: 'white',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap'
              },
              onMouseEnter: function(e) { 
                e.currentTarget.style.transform = 'translateY(-4px)'; 
                e.currentTarget.style.boxShadow = '0 20px 30px -12px rgba(0,0,0,0.15)';
              },
              onMouseLeave: function(e) { 
                e.currentTarget.style.transform = 'translateY(0)'; 
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
              }
            },
              React.createElement('div', { 
                style: { 
                  width: '280px', 
                  flexShrink: 0, 
                  position: 'relative',
                  background: '#f1f5f9'
                } 
              },
                React.createElement('img', { 
                  src: getRoomImage(room.name), 
                  alt: room.name, 
                  style: { width: '100%', height: '100%', objectFit: 'cover', minHeight: '220px' } 
                }),
                React.createElement('div', { 
                  style: { 
                    position: 'absolute', 
                    top: '1rem', 
                    right: '1rem', 
                    background: 'rgba(0,0,0,0.8)', 
                    backdropFilter: 'blur(8px)', 
                    color: 'white', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '9999px', 
                    fontWeight: '700', 
                    fontSize: '0.875rem' 
                  } 
                },
                  formatPrice(room.price_per_night),
                  React.createElement('span', { style: { fontSize: '0.65rem', fontWeight: 'normal' } }, ' / night')
                )
              ),
              React.createElement('div', { style: { flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' } },
                  React.createElement('h3', { style: { fontSize: '1.25rem', fontWeight: '700', margin: 0 } }, room.name),
                  React.createElement('span', { 
                    style: { 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.7rem', 
                      fontWeight: '600',
                      background: room.status === 'available' ? '#d1fae5' : '#fee2e2',
                      color: room.status === 'available' ? '#065f46' : '#991b1b'
                    } 
                  }, room.status)
                ),
                React.createElement('div', { style: { display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.75rem', color: '#64748b', flexWrap: 'wrap' } },
                  React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: '0.25rem' } }, 
                    React.createElement(Users, { size: 12 }), ' ' + (room.capacity || 2) + ' guests'
                  ),
                  React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: '0.25rem' } }, 
                    React.createElement(Star, { size: 12, fill: '#fbbf24', color: '#fbbf24' }), ' 4.9'
                  ),
                  React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: '0.25rem' } }, 
                    React.createElement(Home, { size: 12 }), ' ' + (room.type || 'Standard')
                  )
                ),
                React.createElement('p', { style: { color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: '1.5' } }, 
                  room.description || 'Comfortable space with modern amenities.'
                ),
                React.createElement('div', { style: { display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' } },
                  React.createElement('div', { style: { width: '32px', height: '32px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' } }, 
                    React.createElement(Wifi, { size: 14 })
                  ),
                  React.createElement('div', { style: { width: '32px', height: '32px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' } }, 
                    React.createElement(Coffee, { size: 14 })
                  ),
                  React.createElement('div', { style: { width: '32px', height: '32px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' } }, 
                    React.createElement(Tv, { size: 14 })
                  ),
                  React.createElement('div', { style: { width: '32px', height: '32px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' } }, 
                    React.createElement(Bath, { size: 14 })
                  )
                ),
                React.createElement('button', {
                  onClick: function (e) { 
                    e.preventDefault();
                    handleBookNow(room);
                  },
                  className: 'btn btn-primary',
                  style: { 
                    alignSelf: 'flex-start', 
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer'
                  }
                }, 'Book Now')
              )
            );
          })
        )
      ),

      // Sports/Event CTA
      business.business_type !== 'hotel' && React.createElement('div', { className: 'hotel-card', style: { textAlign: 'center', marginTop: '1.5rem' } },
        React.createElement('div', { style: { fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' } }, 
          business.business_type === 'sports' ? 'Ready to play?' : 'Ready to celebrate?'
        ),
        React.createElement('p', { style: { color: '#64748b', marginBottom: '1.25rem', fontSize: '0.875rem' } }, 
          'Select your date and time to get started.'
        ),
        React.createElement('button', { 
          className: 'btn btn-primary', 
          onClick: function () { setBookingStarted(true); }, 
          style: { width: '100%', padding: '0.875rem' } 
        },
          business.business_type === 'sports' ? 'Book a Court' : 'Plan Your Event'
        ),
        React.createElement('p', { style: { color: '#94a3b8', fontSize: '0.7rem', marginTop: '0.75rem' } }, 
          'No payment required to book'
        )
      )
    ),

    // Lightbox
    lightboxOpen && React.createElement('div', { className: 'lightbox-backdrop', onClick: closeLightbox },
      React.createElement('div', { className: 'lightbox-container', onClick: function (e) { e.stopPropagation(); } },
        React.createElement('button', { className: 'lightbox-close', onClick: closeLightbox }, React.createElement(X, { size: 24 })),
        React.createElement('button', { 
          className: 'lightbox-nav', 
          onClick: goToPrev, 
          style: { position: 'absolute', top: '50%', left: '-3rem', transform: 'translateY(-50%)' } 
        }, React.createElement(ChevronLeft, { size: 28 })),
        React.createElement('img', { 
          src: galleryImages[lightboxIndex] ? galleryImages[lightboxIndex].image_url : '', 
          alt: 'Gallery', 
          className: 'lightbox-image' 
        }),
        React.createElement('button', { 
          className: 'lightbox-nav', 
          onClick: goToNext, 
          style: { position: 'absolute', top: '50%', right: '-3rem', transform: 'translateY(-50%)' } 
        }, React.createElement(ChevronRight, { size: 28 })),
        React.createElement('div', { 
          style: { position: 'absolute', bottom: '-2.5rem', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' } 
        }, (lightboxIndex + 1) + ' / ' + galleryImages.length)
      )
    ),

    // Booking Modal
    showBookingForm && selectedRoom && React.createElement(BookingFormModal, {
      business: business,
      room: selectedRoom,
      dateRange: dateRange,
      guests: guests,
      onClose: function () { setShowBookingForm(false); },
      onSuccess: function () { setShowBookingForm(false); },
      API_BASE: API_BASE,
      formatPrice: formatPrice,
      businessName: business.name
    })
  );
}

// ============================================================
// BOOKING FORM MODAL - 3 STEP FLOW (Form → Payment → Receipt)
// ============================================================

function BookingFormModal({ business, room, dateRange, guests, onClose, onSuccess, API_BASE, formatPrice, businessName }) {
  // Step management: 'form', 'payment', 'receipt'
  var _useState = React.useState('form');
  var step = _useState[0];
  var setStep = _useState[1];
  
  // Form data
  var _useState2 = React.useState({ name: '', email: '', phone: '', specialRequests: '' });
  var formData = _useState2[0];
  var setFormData = _useState2[1];
  
  // Booking data
  var _useState3 = React.useState(null);
  var createdBooking = _useState3[0];
  var setCreatedBooking = _useState3[1];
  
  // Loading states
  var _useState4 = React.useState(false);
  var creatingBooking = _useState4[0];
  var setCreatingBooking = _useState4[1];
  var _useState5 = React.useState(false);
  var isSubmitting = _useState5[0];
  var setIsSubmitting = _useState5[1];
  
  // Receipt data
  var _useState6 = React.useState(null);
  var paymentReceipt = _useState6[0];
  var setPaymentReceipt = _useState6[1];
  
  var nights = dateRange.checkIn && dateRange.checkOut 
    ? Math.ceil((new Date(dateRange.checkOut) - new Date(dateRange.checkIn)) / (1000 * 60 * 60 * 24))
    : 1;
  var totalAmount = (room.price_per_night || 0) * nights;

  // Create booking first
  function createBooking(isPayAtVenue) {
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }
    
    setCreatingBooking(true);
    
    var bookingData = {
      businessId: business.id,
      roomId: room.id,
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      totalAmount: totalAmount,
      checkIn: dateRange.checkIn,
      checkOut: dateRange.checkOut,
      guests: guests,
      specialRequests: formData.specialRequests
    };
    
    fetch(API_BASE + '/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    })
      .then(function (response) { 
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json(); 
      })
      .then(function (data) {
        if (data.success && data.booking) {
          setCreatedBooking(data.booking);
          setCreatingBooking(false);
          
          if (isPayAtVenue) {
            // Pay at venue - show receipt immediately
            setPaymentReceipt({
              bookingReference: data.booking.booking_reference,
              paymentMethod: 'Pay at Venue',
              amountPaid: totalAmount,
              paidAt: new Date().toLocaleString()
            });
            setStep('receipt');
          } else {
            // Proceed to payment step
            setStep('payment');
          }
        } else {
          alert('Failed to create booking. Please try again.');
          setCreatingBooking(false);
        }
      })
      .catch(function (err) { 
        console.error('Create booking error:', err);
        alert('Something went wrong. Please try again.'); 
        setCreatingBooking(false);
      });
  }

  // Handle successful payment
  function handlePaymentSuccess(paymentReference) {
    setIsSubmitting(true);
    
    var updateData = {
      payment_reference: paymentReference,
      payment_status: 'paid',
      amount_paid: totalAmount
    };
    
    fetch(API_BASE + '/api/bookings/' + createdBooking.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data.success) {
          setPaymentReceipt({
            bookingReference: createdBooking.booking_reference,
            paymentMethod: 'Card (Paystack)',
            amountPaid: totalAmount,
            paidAt: new Date().toLocaleString(),
            transactionId: paymentReference
          });
          setStep('receipt');
        } else {
          alert('Booking confirmed but payment record needs verification.');
          setPaymentReceipt({
            bookingReference: createdBooking.booking_reference,
            paymentMethod: 'Pending Verification',
            amountPaid: totalAmount,
            paidAt: new Date().toLocaleString()
          });
          setStep('receipt');
        }
      })
      .catch(function () { 
        alert('Booking confirmed! We\'ll verify your payment shortly.');
        setPaymentReceipt({
          bookingReference: createdBooking.booking_reference,
          paymentMethod: 'Pending Verification',
          amountPaid: totalAmount,
          paidAt: new Date().toLocaleString()
        });
        setStep('receipt');
      })
      .finally(function () { 
        setIsSubmitting(false); 
      });
  }

  // Render Receipt Step
  if (step === 'receipt' && paymentReceipt) {
    return React.createElement(ReceiptModal, {
      receipt: paymentReceipt,
      booking: createdBooking,
      room: room,
      dateRange: dateRange,
      guests: guests,
      businessName: businessName,
      onClose: onClose,
      onSuccess: onSuccess,
      formatPrice: formatPrice
    });
  }

  // Render Payment Step
  if (step === 'payment' && createdBooking) {
    var amountInKobo = totalAmount * 100;
    return React.createElement(PaymentModal, {
      amount: amountInKobo,
      email: formData.email,
      bookingReference: createdBooking.booking_reference,
      totalAmount: totalAmount,
      roomName: room.name,
      dateRange: dateRange,
      nights: nights,
      guests: guests,
      onSuccess: handlePaymentSuccess,
      onClose: function() { setStep('form'); },
      formatPrice: formatPrice,
      API_BASE: API_BASE
    });
  }

  // Render Form Step
  return React.createElement('div', { className: 'modal-overlay', onClick: onClose },
    React.createElement('div', { 
      className: 'modal-content', 
      onClick: function (e) { e.stopPropagation(); },
      style: { 
        maxWidth: '500px', 
        width: '90%', 
        maxHeight: '90vh', 
        display: 'flex', 
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden'
      } 
    },
      // Fixed Header
      React.createElement('div', { style: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid #e2e8f0',
        flexShrink: 0
      } },
        React.createElement('h3', { style: { margin: 0, fontSize: '1.25rem', fontWeight: '700' } }, 'Complete Your Booking'),
        React.createElement('button', { 
          onClick: onClose, 
          style: { background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px' } 
        }, React.createElement(X, { size: 20 }))
      ),
      
      // Scrollable Content
      React.createElement('div', { style: { 
        flex: 1, 
        overflowY: 'auto', 
        padding: '1.5rem'
      } },
        React.createElement('div', { style: { background: '#f8fafc', padding: '1rem', borderRadius: '1rem', marginBottom: '1.5rem' } },
          React.createElement('p', { style: { fontWeight: '600', marginBottom: '0.25rem', fontSize: '1rem' } }, room.name),
          React.createElement('p', { style: { fontSize: '0.75rem', color: '#64748b' } }, 
            dateRange.checkIn + ' → ' + dateRange.checkOut + ' · ' + nights + ' night(s) · ' + guests + ' guest(s)'
          ),
          React.createElement('p', { style: { fontSize: '1.125rem', fontWeight: '700', color: '#4f46e5', marginTop: '0.5rem' } }, 
            'Total: ' + formatPrice(totalAmount)
          )
        ),
        
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '1rem' } },
          React.createElement('input', { 
            type: 'text', 
            placeholder: 'Full Name *', 
            value: formData.name, 
            onChange: function (e) { setFormData({ ...formData, name: e.target.value }); }, 
            className: 'form-control', 
            required: true 
          }),
          React.createElement('input', { 
            type: 'email', 
            placeholder: 'Email Address *', 
            value: formData.email, 
            onChange: function (e) { setFormData({ ...formData, email: e.target.value }); }, 
            className: 'form-control', 
            required: true 
          }),
          React.createElement('input', { 
            type: 'tel', 
            placeholder: 'Phone Number *', 
            value: formData.phone, 
            onChange: function (e) { setFormData({ ...formData, phone: e.target.value }); }, 
            className: 'form-control', 
            required: true 
          }),
          React.createElement('textarea', { 
            placeholder: 'Special Requests (optional)', 
            value: formData.specialRequests, 
            onChange: function (e) { setFormData({ ...formData, specialRequests: e.target.value }); }, 
            rows: 2, 
            className: 'form-control', 
            style: { fontFamily: 'inherit' } 
          })
        )
      ),
      
      // Fixed Footer
      React.createElement('div', { style: { 
        padding: '1.25rem 1.5rem',
        borderTop: '1px solid #e2e8f0',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      } },
        React.createElement('button', { 
          type: 'button',
          onClick: function () { createBooking(false); }, 
          disabled: creatingBooking, 
          className: 'btn btn-primary', 
          style: { width: '100%', padding: '0.875rem' } 
        }, creatingBooking ? 'Creating booking...' : 'Proceed to Payment'),
        React.createElement('button', { 
          type: 'button', 
          onClick: function () { createBooking(true); }, 
          className: 'btn btn-secondary', 
          style: { width: '100%', padding: '0.875rem' } 
        }, 'Pay at Venue')
      )
    )
  );
}

// ============================================================
// PAYMENT MODAL COMPONENT
// ============================================================

function PaymentModal({ amount, email, bookingReference, totalAmount, roomName, dateRange, nights, guests, onSuccess, onClose, formatPrice, API_BASE }) {
  var _useState = React.useState(null);
  var PaystackComponent = _useState[0];
  var setPaystackComponent = _useState[1];
  var _useState2 = React.useState(false);
  var isLoading = _useState2[0];
  var setIsLoading = _useState2[1];

  React.useEffect(function () {
    setIsLoading(true);
    import('./PaystackPayment')
      .then(function (module) {
        setPaystackComponent(function () { return module.default; });
        setIsLoading(false);
      })
      .catch(function (err) {
        console.error('Failed to load Paystack:', err);
        alert('Payment system error. Please use "Pay at Venue" instead.');
        onClose();
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return React.createElement('div', { className: 'modal-overlay' },
      React.createElement('div', { className: 'modal-content', style: { textAlign: 'center', padding: '2rem' } },
        React.createElement('div', { className: 'loading-spinner' }),
        React.createElement('p', { style: { marginTop: '1rem' } }, 'Loading payment gateway...')
      )
    );
  }

  if (PaystackComponent) {
    return React.createElement('div', { className: 'modal-overlay', onClick: onClose },
      React.createElement('div', { 
        className: 'modal-content', 
        onClick: function (e) { e.stopPropagation(); },
        style: { 
          maxWidth: '500px', 
          width: '90%', 
          padding: 0,
          overflow: 'hidden'
        } 
      },
        // Header
        React.createElement('div', { style: { 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        } },
          React.createElement('div', null,
            React.createElement('h3', { style: { margin: 0, fontSize: '1rem', fontWeight: '600', opacity: 0.9 } }, 'Complete Payment'),
            React.createElement('p', { style: { margin: '4px 0 0 0', fontSize: '0.75rem', opacity: 0.8 } }, roomName)
          ),
          React.createElement('button', { 
            onClick: onClose, 
            style: { background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', color: 'white' } 
          }, React.createElement(X, { size: 20 }))
        ),
        
        // Booking Summary
        React.createElement('div', { style: { padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' } },
            React.createElement('span', { style: { fontSize: '0.75rem', color: '#64748b' } }, 'Dates'),
            React.createElement('span', { style: { fontSize: '0.875rem', fontWeight: '500' } }, dateRange.checkIn + ' → ' + dateRange.checkOut)
          ),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' } },
            React.createElement('span', { style: { fontSize: '0.75rem', color: '#64748b' } }, 'Stay Duration'),
            React.createElement('span', { style: { fontSize: '0.875rem', fontWeight: '500' } }, nights + ' night(s)')
          ),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' } },
            React.createElement('span', { style: { fontSize: '0.75rem', color: '#64748b' } }, 'Guests'),
            React.createElement('span', { style: { fontSize: '0.875rem', fontWeight: '500' } }, guests + ' guest(s)')
          ),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', marginTop: '0.5rem', borderTop: '1px dashed #e2e8f0' } },
            React.createElement('span', { style: { fontSize: '0.875rem', fontWeight: '600' } }, 'Total Amount'),
            React.createElement('span', { style: { fontSize: '1.125rem', fontWeight: '700', color: '#4f46e5' } }, formatPrice(totalAmount))
          )
        ),
        
        // Paystack Component
        React.createElement('div', { style: { padding: '1.5rem' } },
          React.createElement(PaystackComponent, {
            amount: amount,
            email: email,
            bookingReference: bookingReference,
            onSuccess: onSuccess,
            onClose: onClose
          })
        )
      )
    );
  }

  return null;
}

// ============================================================
// RECEIPT MODAL COMPONENT - Professional Modern Receipt
// ============================================================

function ReceiptModal({ receipt, booking, room, dateRange, guests, businessName, onClose, onSuccess, formatPrice }) {
  var _useState = React.useState(false);
  var isClosing = _useState[0];
  var setIsClosing = _useState[1];

  function handleDone() {
    setIsClosing(true);
    setTimeout(function() {
      onSuccess();
      onClose();
    }, 300);
  }

  function handleDownload() {
    // Create receipt HTML for printing/download
    var receiptHtml = document.getElementById('receipt-content');
    if (receiptHtml) {
      var printWindow = window.open('', '_blank');
      printWindow.document.write('<!DOCTYPE html><html><head><title>Booking Receipt</title><style>');
      printWindow.document.write('body { font-family: Inter, system-ui, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }');
      printWindow.document.write('.receipt-header { text-align: center; margin-bottom: 30px; }');
      printWindow.document.write('.receipt-details { background: #f8fafc; padding: 20px; border-radius: 16px; margin: 20px 0; }');
      printWindow.document.write('.detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; }');
      printWindow.document.write('.success-badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 50px; display: inline-block; }');
      printWindow.document.write('</style></head><body>');
      printWindow.document.write(receiptHtml.cloneNode(true).outerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  }

  var nights = dateRange.checkIn && dateRange.checkOut 
    ? Math.ceil((new Date(dateRange.checkOut) - new Date(dateRange.checkIn)) / (1000 * 60 * 60 * 24))
    : 1;

  return React.createElement('div', { 
    className: 'modal-overlay', 
    onClick: function() { if (!isClosing) handleDone(); },
    style: { animation: isClosing ? 'fadeOut 0.3s ease forwards' : 'none' }
  },
    React.createElement('div', { 
      className: 'modal-content', 
      onClick: function (e) { e.stopPropagation(); },
      style: { 
        maxWidth: '500px', 
        width: '90%', 
        padding: 0,
        overflow: 'hidden',
        animation: isClosing ? 'slideOut 0.3s ease forwards' : 'slideIn 0.3s ease'
      } 
    },
      // Success Header
      React.createElement('div', { style: { 
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        color: 'white'
      } },
        React.createElement('div', { style: { 
          width: '64px', 
          height: '64px', 
          background: 'rgba(255,255,255,0.2)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 1rem'
        } },
          React.createElement(CheckCircle, { size: 32, strokeWidth: 2 })
        ),
        React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' } }, 'Booking Confirmed!'),
        React.createElement('p', { style: { fontSize: '0.875rem', opacity: 0.9 } }), 'Your reservation has been confirmed'
      ),
      
      // Receipt Content
      React.createElement('div', { id: 'receipt-content', style: { padding: '1.5rem' } },
        // Business Info
        React.createElement('div', { style: { textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' } },
          React.createElement('h3', { style: { fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' } }, businessName),
          React.createElement('p', { style: { fontSize: '0.7rem', color: '#64748b' } }, 'Booking Receipt')
        ),
        
        // Booking Reference
        React.createElement('div', { style: { 
          background: '#f8fafc', 
          padding: '0.75rem', 
          borderRadius: '12px', 
          textAlign: 'center',
          marginBottom: '1.5rem'
        } },
          React.createElement('p', { style: { fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' } }, 'Booking Reference'),
          React.createElement('p', { style: { fontSize: '1rem', fontWeight: '700', fontFamily: 'monospace', letterSpacing: '1px' } }, receipt.bookingReference)
        ),
        
        // Booking Details Grid
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' } },
          React.createElement('div', null,
            React.createElement('p', { style: { fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.25rem' } }, 'Room'),
            React.createElement('p', { style: { fontSize: '0.875rem', fontWeight: '600' } }, room.name)
          ),
          React.createElement('div', null,
            React.createElement('p', { style: { fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.25rem' } }, 'Guests'),
            React.createElement('p', { style: { fontSize: '0.875rem', fontWeight: '600' } }, guests + ' guest(s)')
          ),
          React.createElement('div', null,
            React.createElement('p', { style: { fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.25rem' } }, 'Check-in'),
            React.createElement('p', { style: { fontSize: '0.875rem', fontWeight: '500' } }, dateRange.checkIn)
          ),
          React.createElement('div', null,
            React.createElement('p', { style: { fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.25rem' } }, 'Check-out'),
            React.createElement('p', { style: { fontSize: '0.875rem', fontWeight: '500' } }, dateRange.checkOut)
          ),
          React.createElement('div', null,
            React.createElement('p', { style: { fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.25rem' } }, 'Stay Duration'),
            React.createElement('p', { style: { fontSize: '0.875rem', fontWeight: '500' } }, nights + ' night(s)')
          ),
          React.createElement('div', null,
            React.createElement('p', { style: { fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.25rem' } }, 'Payment Method'),
            React.createElement('p', { style: { fontSize: '0.875rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.25rem' } }, 
              React.createElement(CreditCard, { size: 12 }), receipt.paymentMethod
            )
          )
        ),
        
        // Customer Details
        booking && React.createElement('div', { style: { marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' } },
          React.createElement('p', { style: { fontSize: '0.7rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' } }, 'Customer Details'),
          React.createElement('p', { style: { fontSize: '0.875rem', fontWeight: '500' } }, booking.customer_name),
          React.createElement('p', { style: { fontSize: '0.75rem', color: '#64748b' } }, booking.customer_email),
          React.createElement('p', { style: { fontSize: '0.75rem', color: '#64748b' } }, booking.customer_phone)
        ),
        
        // Total Amount
        React.createElement('div', { style: { 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingTop: '1rem',
          borderTop: '2px solid #e2e8f0'
        } },
          React.createElement('span', { style: { fontSize: '0.875rem', fontWeight: '600' } }, 'Total Paid'),
          React.createElement('span', { style: { fontSize: '1.25rem', fontWeight: '800', color: '#10b981' } }, formatPrice(receipt.amountPaid))
        ),
        
        // Note
        React.createElement('p', { style: { fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', marginTop: '1rem' } }, 
          'A confirmation email has been sent to your email address.'
        )
      ),
      
      // Footer Buttons
      React.createElement('div', { style: { 
        padding: '1rem 1.5rem 1.5rem',
        display: 'flex',
        gap: '0.75rem',
        borderTop: '1px solid #e2e8f0'
      } },
        React.createElement('button', { 
          onClick: handleDownload, 
          className: 'btn btn-secondary', 
          style: { flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' } 
        }, React.createElement(Download, { size: 16 }), 'Download'),
        React.createElement('button', { 
          onClick: handleDone, 
          className: 'btn btn-primary', 
          style: { flex: 1 } 
        }, 'Done')
      )
    )
  );
}

export default UnifiedBookingPage;