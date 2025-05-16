// src/pages/CustomerBookingHistory.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import './CustomerBookings.css';

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
    <div className="booking-container">
      <div className="booking-header">
        <h1>Your Booking Notification</h1>
        <button className="back-btn" onClick={() => navigate('/customer')}>
          Go Back
        </button>
      </div>

      <div className="filter-section">
        <label>Status Filter:</label>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="booking-list">
        {bookings.length === 0 ? (
          <p className="no-bookings">No bookings found.</p>
        ) : (
          bookings.map(b => (
            <div key={b.id} className="booking-card">
              <p><strong>Service:</strong> {b.catering_services?.title}</p>
              <p><strong>Date:</strong> {new Date(b.booking_date).toLocaleString()}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`status ${b.status}`}>{b.status}</span>
              </p>
              {b.special_requests && (
                <p><strong>Requests:</strong> {b.special_requests}</p>
              )}

              {b.status === 'pending' && (
                <button className="cancel-btn" onClick={() => cancelBooking(b.id)}>
                  Cancel Booking
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
