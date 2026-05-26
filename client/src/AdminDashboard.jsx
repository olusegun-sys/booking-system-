import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Building2, Users, Calendar, DollarSign, 
  TrendingUp, CheckCircle, XCircle, Clock, Search, Filter,
  ChevronRight, Menu, LogOut, Shield, Star, Phone, Mail,
  Plus, Edit2, Trash2, Eye, RefreshCw, Download
} from 'lucide-react';
import { showSuccess, showError } from './toast';

// Direct API detection - no external file needed
const getAPI_BASE = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168')) {
    return 'http://localhost:5000';
  }
  return 'https://booking-hub-api.onrender.com';
};
const API_BASE = getAPI_BASE();

function AdminDashboard({ admin, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    pendingBusinesses: 0,
    activeBusinesses: 0,
    totalBookings: 0,
    totalRevenue: 0
  });
  const [isDesktop, setIsDesktop] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [businesses, searchTerm, statusFilter]);

  const filterBusinesses = () => {
    let filtered = [...businesses];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.name?.toLowerCase().includes(term) ||
        b.email?.toLowerCase().includes(term) ||
        b.city?.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    setFilteredBusinesses(filtered);
  };

  const fetchBusinesses = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/businesses`, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('admin_token') }
      });
      const data = await response.json();
      if (data.success) {
        setBusinesses(data.businesses || []);
        setFilteredBusinesses(data.businesses || []);
        calculateStats(data.businesses || []);
      }
    } catch (err) {
      console.error('Failed to fetch businesses:', err);
      showError('Failed to load businesses');
    }
    setLoading(false);
  };

  const calculateStats = (businessesList) => {
    let totalBookings = 0;
    let totalRevenue = 0;
    let pending = 0;
    let active = 0;

    businessesList.forEach(b => {
      if (b.status === 'pending') pending++;
      if (b.status === 'active') active++;
      totalBookings += (b.total_bookings || 0);
      totalRevenue += (b.total_revenue || 0);
    });

    setStats({
      totalBusinesses: businessesList.length,
      pendingBusinesses: pending,
      activeBusinesses: active,
      totalBookings: totalBookings,
      totalRevenue: totalRevenue
    });
  };

  const approveBusiness = async (businessId) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/businesses/${businessId}/approve`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('admin_token')
        }
      });
      const data = await response.json();
      if (data.success) {
        showSuccess('Business approved successfully');
        fetchBusinesses();
      } else {
        showError(data.error || 'Failed to approve business');
      }
    } catch (err) {
      showError('Something went wrong');
    }
  };

  const rejectBusiness = async (businessId) => {
    if (!confirm('Reject this business application?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/admin/businesses/${businessId}/reject`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('admin_token')
        }
      });
      const data = await response.json();
      if (data.success) {
        showSuccess('Business rejected');
        fetchBusinesses();
      } else {
        showError(data.error || 'Failed to reject business');
      }
    } catch (err) {
      showError('Something went wrong');
    }
  };

  const deleteBusiness = async (businessId) => {
    if (!confirm('Delete this business permanently? This cannot be undone.')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/admin/businesses/${businessId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('admin_token') }
      });
      const data = await response.json();
      if (data.success) {
        showSuccess('Business deleted');
        fetchBusinesses();
      } else {
        showError(data.error || 'Failed to delete business');
      }
    } catch (err) {
      showError('Something went wrong');
    }
  };

  const viewBusinessDetails = (business) => {
    setSelectedBusiness(business);
    setShowBusinessModal(true);
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return { color: '#10b981', bg: '#d1fae5', text: 'Active', icon: CheckCircle };
    } else if (status === 'pending') {
      return { color: '#f59e0b', bg: '#fef3c7', text: 'Pending', icon: Clock };
    } else {
      return { color: '#ef4444', bg: '#fee2e2', text: 'Rejected', icon: XCircle };
    }
  };

  const getBusinessTypeLabel = (type) => {
    if (type === 'hotel') return 'Hotel';
    if (type === 'sports') return 'Sports Facility';
    if (type === 'event') return 'Event Venue';
    return 'Business';
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'businesses', label: 'Businesses', icon: Building2 },
    { id: 'bookings', label: 'Bookings', icon: Calendar }
  ];

  if (loading) {
    return React.createElement('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' } },
      React.createElement('div', { className: 'loading-spinner' })
    );
  }

  const containerStyle = {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc'
  };

  const sidebarStyle = {
    width: isDesktop ? '280px' : '0',
    background: 'white',
    borderRight: '1px solid #e2e8f0',
    transition: 'width 0.3s ease',
    overflow: 'hidden'
  };

  const mainContentStyle = {
    flex: 1,
    minWidth: 0
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? 'repeat(5, 1fr)' : 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '32px'
  };

  const statCardStyle = {
    background: 'white',
    borderRadius: '20px',
    padding: '20px',
    border: '1px solid #eef2ff'
  };

  const businessTableStyle = {
    background: 'white',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  };

  const tableHeaderStyle = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? '2fr 1.5fr 1fr 1fr 1.5fr' : '1fr',
    background: '#f8fafc',
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    fontWeight: '600',
    fontSize: '13px',
    color: '#64748b'
  };

  const renderOverview = () => {
    return React.createElement('div', null,
      React.createElement('div', { style: statsGridStyle },
        React.createElement('div', { style: statCardStyle },
          React.createElement('div', { style: { fontSize: '13px', color: '#64748b', marginBottom: '8px' } }, 'Total Businesses'),
          React.createElement('div', { style: { fontSize: '32px', fontWeight: '700', color: '#0f172a' } }, stats.totalBusinesses),
          React.createElement('div', { style: { fontSize: '12px', color: '#10b981', marginTop: '8px' } }, '+ ' + stats.activeBusinesses + ' active')
        ),
        React.createElement('div', { style: statCardStyle },
          React.createElement('div', { style: { fontSize: '13px', color: '#64748b', marginBottom: '8px' } }, 'Pending Approval'),
          React.createElement('div', { style: { fontSize: '32px', fontWeight: '700', color: '#f59e0b' } }, stats.pendingBusinesses),
          React.createElement('div', { style: { fontSize: '12px', color: '#64748b', marginTop: '8px' } }, 'Awaiting review')
        ),
        React.createElement('div', { style: statCardStyle },
          React.createElement('div', { style: { fontSize: '13px', color: '#64748b', marginBottom: '8px' } }, 'Active Businesses'),
          React.createElement('div', { style: { fontSize: '32px', fontWeight: '700', color: '#0f172a' } }, stats.activeBusinesses),
          React.createElement('div', { style: { fontSize: '12px', color: '#64748b', marginTop: '8px' } }, 'Live on platform')
        ),
        React.createElement('div', { style: statCardStyle },
          React.createElement('div', { style: { fontSize: '13px', color: '#64748b', marginBottom: '8px' } }, 'Total Bookings'),
          React.createElement('div', { style: { fontSize: '32px', fontWeight: '700', color: '#0f172a' } }, stats.totalBookings),
          React.createElement('div', { style: { fontSize: '12px', color: '#64748b', marginTop: '8px' } }, 'All time')
        ),
        React.createElement('div', { style: statCardStyle },
          React.createElement('div', { style: { fontSize: '13px', color: '#64748b', marginBottom: '8px' } }, 'Total Revenue'),
          React.createElement('div', { style: { fontSize: '32px', fontWeight: '700', color: '#4f46e5' } }, '₦' + stats.totalRevenue.toLocaleString()),
          React.createElement('div', { style: { fontSize: '12px', color: '#64748b', marginTop: '8px' } }, 'Platform-wide')
        )
      ),
      React.createElement('div', { style: businessTableStyle },
        React.createElement('div', { style: { padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#fafbff' } },
          React.createElement('h3', { style: { fontSize: '16px', fontWeight: '600', margin: 0 } }, 'Recent Businesses'),
          React.createElement('p', { style: { fontSize: '13px', color: '#64748b', marginTop: '4px' } }, 'Recently joined businesses awaiting review')
        ),
        React.createElement('div', { style: { overflowX: 'auto' } },
          React.createElement('div', null,
            React.createElement('div', { style: tableHeaderStyle },
              React.createElement('div', null, 'Business'),
              React.createElement('div', null, 'Contact'),
              React.createElement('div', null, 'Type'),
              React.createElement('div', null, 'Status'),
              React.createElement('div', null, 'Actions')
            ),
            filteredBusinesses.slice(0, 5).map(business => {
              const status = getStatusBadge(business.status);
              const StatusIcon = status.icon;
              return React.createElement('div', { key: business.id, style: { display: 'grid', gridTemplateColumns: isDesktop ? '2fr 1.5fr 1fr 1fr 1.5fr' : '1fr', padding: '16px 20px', borderBottom: '1px solid #f1f5f9', alignItems: 'center', gap: '12px' } },
                React.createElement('div', null,
                  React.createElement('div', { style: { fontWeight: '600', color: '#0f172a' } }, business.name),
                  React.createElement('div', { style: { fontSize: '12px', color: '#64748b', marginTop: '2px' } }, business.city + ', ' + business.state)
                ),
                React.createElement('div', null,
                  React.createElement('div', { style: { fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' } }, React.createElement(Mail, { size: 12 }), business.email),
                  React.createElement('div', { style: { fontSize: '12px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' } }, React.createElement(Phone, { size: 12 }), business.phone)
                ),
                React.createElement('div', null,
                  React.createElement('span', { style: { background: '#eef2ff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', color: '#4f46e5' } }, getBusinessTypeLabel(business.business_type))
                ),
                React.createElement('div', null,
                  React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: status.bg, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', color: status.color } },
                    React.createElement(StatusIcon, { size: 12 }), status.text
                  )
                ),
                React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                  React.createElement('button', { 
                    onClick: () => viewBusinessDetails(business), 
                    style: { padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' } 
                  }, React.createElement(Eye, { size: 12 }), 'View'),
                  business.status === 'pending' && React.createElement('button', { 
                    onClick: () => approveBusiness(business.id), 
                    style: { padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' } 
                  }, React.createElement(CheckCircle, { size: 12 }), 'Approve'),
                  business.status === 'pending' && React.createElement('button', { 
                    onClick: () => rejectBusiness(business.id), 
                    style: { padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' } 
                  }, React.createElement(XCircle, { size: 12 }), 'Reject')
                )
              );
            })
          )
        ),
        filteredBusinesses.length === 0 && React.createElement('div', { style: { textAlign: 'center', padding: '60px', color: '#94a3b8' } }, 'No businesses found')
      )
    );
  };

  const renderBusinesses = () => {
    return React.createElement('div', null,
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' } },
        React.createElement('div', null,
          React.createElement('h2', { style: { fontSize: '24px', fontWeight: '700', margin: 0 } }, 'All Businesses'),
          React.createElement('p', { style: { color: '#64748b', marginTop: '4px' } }, 'Manage all registered businesses')
        ),
        React.createElement('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
          React.createElement('div', { style: { position: 'relative' } },
            React.createElement(Search, { size: 16, style: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' } }),
            React.createElement('input', {
              type: 'text',
              placeholder: 'Search businesses...',
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              style: { padding: '10px 16px 10px 36px', border: '1.5px solid #e2e8f0', borderRadius: '40px', fontSize: '14px', width: '250px' }
            })
          ),
          React.createElement('select', {
            value: statusFilter,
            onChange: (e) => setStatusFilter(e.target.value),
            style: { padding: '10px 16px', border: '1.5px solid #e2e8f0', borderRadius: '40px', fontSize: '14px', background: 'white' }
          },
            React.createElement('option', { value: 'all' }, 'All Status'),
            React.createElement('option', { value: 'active' }, 'Active'),
            React.createElement('option', { value: 'pending' }, 'Pending'),
            React.createElement('option', { value: 'rejected' }, 'Rejected')
          )
        )
      ),
      React.createElement('div', { style: businessTableStyle },
        React.createElement('div', { style: { overflowX: 'auto' } },
          React.createElement('div', null,
            React.createElement('div', { style: tableHeaderStyle },
              React.createElement('div', null, 'Business'),
              React.createElement('div', null, 'Contact'),
              React.createElement('div', null, 'Type'),
              React.createElement('div', null, 'Bookings'),
              React.createElement('div', null, 'Status'),
              React.createElement('div', null, 'Actions')
            ),
            filteredBusinesses.map(business => {
              const status = getStatusBadge(business.status);
              const StatusIcon = status.icon;
              return React.createElement('div', { key: business.id, style: { display: 'grid', gridTemplateColumns: isDesktop ? '2fr 1.5fr 1fr 1fr 1fr 1.5fr' : '1fr', padding: '16px 20px', borderBottom: '1px solid #f1f5f9', alignItems: 'center', gap: '12px' } },
                React.createElement('div', null,
                  React.createElement('div', { style: { fontWeight: '600', color: '#0f172a' } }, business.name),
                  React.createElement('div', { style: { fontSize: '12px', color: '#64748b', marginTop: '2px' } }, business.city + ', ' + business.state)
                ),
                React.createElement('div', null,
                  React.createElement('div', { style: { fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' } }, React.createElement(Mail, { size: 12 }), business.email),
                  React.createElement('div', { style: { fontSize: '12px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' } }, React.createElement(Phone, { size: 12 }), business.phone)
                ),
                React.createElement('div', null,
                  React.createElement('span', { style: { background: '#eef2ff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', color: '#4f46e5' } }, getBusinessTypeLabel(business.business_type))
                ),
                React.createElement('div', null,
                  React.createElement('div', { style: { fontWeight: '600', color: '#0f172a' } }, business.total_bookings || 0),
                  React.createElement('div', { style: { fontSize: '11px', color: '#64748b' } }, '₦' + (business.total_revenue || 0).toLocaleString())
                ),
                React.createElement('div', null,
                  React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: status.bg, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', color: status.color } },
                    React.createElement(StatusIcon, { size: 12 }), status.text
                  )
                ),
                React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                  React.createElement('button', { 
                    onClick: () => viewBusinessDetails(business), 
                    style: { padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' } 
                  }, React.createElement(Eye, { size: 12 }), 'View'),
                  business.status === 'pending' && React.createElement('button', { 
                    onClick: () => approveBusiness(business.id), 
                    style: { padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' } 
                  }, React.createElement(CheckCircle, { size: 12 }), 'Approve'),
                  React.createElement('button', { 
                    onClick: () => deleteBusiness(business.id), 
                    style: { padding: '6px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' } 
                  }, React.createElement(Trash2, { size: 12 }), 'Delete')
                )
              );
            })
          )
        ),
        filteredBusinesses.length === 0 && React.createElement('div', { style: { textAlign: 'center', padding: '60px', color: '#94a3b8' } }, 'No businesses found')
      )
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return renderOverview();
      case 'businesses':
        return renderBusinesses();
      default:
        return renderOverview();
    }
  };

  return React.createElement('div', { style: containerStyle },
    // Mobile menu overlay
    !isDesktop && mobileMenuOpen && React.createElement('div', { 
      style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 },
      onClick: () => setMobileMenuOpen(false)
    }),
    
    // Sidebar
    React.createElement('div', { style: sidebarStyle },
      React.createElement('div', { style: { padding: '28px 20px', borderBottom: '1px solid #e2e8f0' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
          React.createElement('div', { style: { width: '40px', height: '40px', background: '#4f46e5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
            React.createElement(Shield, { size: 20, color: 'white' })
          ),
          React.createElement('div', null,
            React.createElement('h2', { style: { fontSize: '16px', fontWeight: '700', margin: 0 } }, 'Admin Portal'),
            React.createElement('p', { style: { fontSize: '11px', color: '#64748b', margin: 0 } }, admin?.email || 'Administrator')
          )
        )
      ),
      React.createElement('nav', { style: { padding: '16px' } },
        navItems.map(item => 
          React.createElement('button', {
            key: item.id,
            onClick: () => setActiveTab(item.id),
            style: {
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: activeTab === item.id ? '#eef2ff' : 'transparent',
              border: 'none',
              borderRadius: '12px',
              color: activeTab === item.id ? '#4f46e5' : '#475569',
              fontWeight: activeTab === item.id ? '600' : '500',
              cursor: 'pointer',
              marginBottom: '4px'
            }
          },
            React.createElement(item.icon, { size: 18 }),
            item.label
          )
        ),
        React.createElement('button', {
          onClick: onLogout,
          style: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderRadius: '12px',
            color: '#ef4444',
            fontWeight: '500',
            cursor: 'pointer',
            marginTop: '16px'
          }
        },
          React.createElement(LogOut, { size: 18 }),
          'Logout'
        )
      )
    ),
    
    // Main Content
    React.createElement('div', { style: mainContentStyle },
      // Mobile Header
      !isDesktop && React.createElement('div', { style: { background: 'white', padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
          React.createElement('div', { style: { width: '32px', height: '32px', background: '#4f46e5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
            React.createElement(Shield, { size: 16, color: 'white' })
          ),
          React.createElement('span', { style: { fontWeight: '700' } }, 'Admin Portal')
        ),
        React.createElement('button', { onClick: () => setMobileMenuOpen(true), style: { background: 'none', border: 'none' } },
          React.createElement(Menu, { size: 24 })
        )
      ),
      
      // Content Area
      React.createElement('div', { style: { padding: isDesktop ? '32px' : '20px' } }, renderContent())
    ),
    
    // Business Details Modal
    showBusinessModal && selectedBusiness && React.createElement('div', { 
      style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
      onClick: () => setShowBusinessModal(false)
    },
      React.createElement('div', { 
        style: { background: 'white', borderRadius: '24px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto' },
        onClick: (e) => e.stopPropagation()
      },
        React.createElement('div', { style: { padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
          React.createElement('h3', { style: { fontSize: '20px', fontWeight: '700', margin: 0 } }, selectedBusiness.name),
          React.createElement('button', { onClick: () => setShowBusinessModal(false), style: { background: 'none', border: 'none', cursor: 'pointer' } }, React.createElement(XCircle, { size: 20 }))
        ),
        React.createElement('div', { style: { padding: '24px' } },
          React.createElement('div', { style: { marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' } },
            React.createElement('span', { style: { background: '#eef2ff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', color: '#4f46e5' } }, getBusinessTypeLabel(selectedBusiness.business_type)),
            React.createElement('span', { style: { background: getStatusBadge(selectedBusiness.status).bg, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', color: getStatusBadge(selectedBusiness.status).color } }, getStatusBadge(selectedBusiness.status).text)
          ),
          React.createElement('div', { style: { marginBottom: '16px' } },
            React.createElement('label', { style: { fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '4px', display: 'block' } }, 'Email'),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, React.createElement(Mail, { size: 14 }), selectedBusiness.email)
          ),
          React.createElement('div', { style: { marginBottom: '16px' } },
            React.createElement('label', { style: { fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '4px', display: 'block' } }, 'Phone'),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, React.createElement(Phone, { size: 14 }), selectedBusiness.phone)
          ),
          React.createElement('div', { style: { marginBottom: '16px' } },
            React.createElement('label', { style: { fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '4px', display: 'block' } }, 'Location'),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, React.createElement(MapPin, { size: 14 }), selectedBusiness.city + ', ' + selectedBusiness.state)
          ),
          selectedBusiness.description && React.createElement('div', { style: { marginBottom: '16px' } },
            React.createElement('label', { style: { fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '4px', display: 'block' } }, 'Description'),
            React.createElement('p', { style: { fontSize: '14px', color: '#475569', margin: 0 } }, selectedBusiness.description)
          ),
          React.createElement('div', { style: { display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' } },
            selectedBusiness.status === 'pending' && React.createElement('button', { 
              onClick: () => { approveBusiness(selectedBusiness.id); setShowBusinessModal(false); }, 
              style: { flex: 1, padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' } 
            }, React.createElement(CheckCircle, { size: 16 }), 'Approve Business'),
            React.createElement('button', { 
              onClick: () => setShowBusinessModal(false), 
              style: { flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer' } 
            }, 'Close')
          )
        )
      )
    )
  );
}

export default AdminDashboard;