import { useState, useEffect } from 'react';
import { LogOut, Calendar, TrendingUp, Users } from 'lucide-react';
import { showError } from './toast';
import useCountUp from './useCountUp';
import EmptyState from './components/ui/EmptyState';
import LoadingSkeleton from './components/ui/LoadingSkeleton';
import BookingCard from './components/ui/BookingCard';
import DashboardLayout from './components/ui/DashboardLayout';

function StaffDashboard({ staff, business, onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/businesses/${business.id}/bookings`);
      const data = await response.json();
      if (data.success) setBookings(data.bookings);
    } catch (error) { showError('Failed to fetch bookings.'); }
    setLoading(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getRoleLabel = (role) => {
    const roles = { owner: 'Owner', manager: 'Manager', staff: 'Staff' };
    return roles[role] || role;
  };

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const todayBookings = bookings.filter(b => b.check_in_date === new Date().toISOString().split('T')[0]).length;

  const animatedConfirmed = useCountUp(confirmedBookings, 1000, !loading);
  const animatedToday = useCountUp(todayBookings, 800, !loading);

  const headerActions = (
    <button className="btn btn-danger" onClick={onLogout} style={{ padding: '10px 20px' }}><LogOut size={16} strokeWidth={2} /> Logout</button>
  );

  const greeting = `${staff.full_name} • ${getRoleLabel(staff.role)}`;

  if (loading) return <LoadingSkeleton type="dashboard" count={3} />;

  return (
    <DashboardLayout business={business} onLogout={onLogout} actions={headerActions} greeting={greeting}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div className="hotel-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'default' }}>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: '500', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Bookings</p>
            <h3 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>{animatedConfirmed}</h3>
          </div>
          <div style={{ background: '#dbeafe', padding: '10px', borderRadius: '12px' }}><Calendar size={20} strokeWidth={2} color="#1e40af" /></div>
        </div>
        <div className="hotel-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'default' }}>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: '500', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Arriving Today</p>
            <h3 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--gray-900)', margin: 0 }}>{animatedToday}</h3>
          </div>
          <div style={{ background: '#d1fae5', padding: '10px', borderRadius: '12px' }}><TrendingUp size={20} strokeWidth={2} color="#065f46" /></div>
        </div>
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--gray-900)', marginBottom: '24px', display: 'flex', alignItems: 'center', letterSpacing: '-0.015em' }}>
        <Calendar size={22} strokeWidth={2} style={{ marginRight: '10px' }} /> Recent Bookings
      </h2>

      {bookings.length === 0 ? (
        <EmptyState icon={Calendar} title="No bookings yet" message="When customers book, they'll appear here." />
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {bookings.map(booking => <BookingCard key={booking.id} booking={booking} formatPrice={formatPrice} formatDate={formatDate} />)}
        </div>
      )}
    </DashboardLayout>
  );
}

export default StaffDashboard;