import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function CustomerBookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const customerId = userData.user.id;
      setUser(userData.user);

      let query = supabase
        .from('bookings')
        .select(`*, catering_services(title)`)
        .eq('customer_id', customerId);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) return alert(error.message);
      setBookings(data);
    };

    fetchBookings();
  }, [statusFilter]);

  const cancelBooking = async (id) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) return alert(error.message);

    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: 'cancelled' } : b))
    );
  };

  return (
    <div style={{ padding: 30 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Your Booking History</h1>
        <button onClick={() => navigate('/customer')}>Go Back</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <label>Status Filter: </label>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ marginLeft: 10 }}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div style={{ display: 'grid', gap: 20, marginTop: 20 }}>
        {bookings.map(b => (
          <div
            key={b.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: 10,
              padding: 20,
              background: '#f9f9f9',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }}
          >
            <p><strong>Service:</strong> {b.catering_services?.title}</p>
            <p><strong>Date:</strong> {new Date(b.booking_date).toLocaleString()}</p>
            <p><strong>Status:</strong> {b.status}</p>
            {b.special_requests && <p><strong>Requests:</strong> {b.special_requests}</p>}

            {b.status === 'pending' && (
              <button onClick={() => cancelBooking(b.id)} style={{ marginTop: 10 }}>
                Cancel Booking
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
