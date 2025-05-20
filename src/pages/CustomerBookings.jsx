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
        .select(`
          *,
          catering_services (
            title,
            seller_id
          ),
          sellers (
            id,
            business_name,
            users (
              email
            )
          )
        `)
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

  const completeBooking = async (id) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', id);

    if (error) return alert(error.message);

    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: 'completed' } : b))
    );
  };

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h1>Your Booking History</h1>
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
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Shop</th>
              <th>Date</th>
              <th>Status</th>
              <th>Request</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-bookings">No bookings found.</td>
              </tr>
            ) : (
              bookings.map(b => (
                <tr key={b.id}>
                  <td>{b.catering_services?.title}</td>
                  <td>{b.sellers?.business_name || 'N/A'}</td>
                  <td>{new Date(b.booking_date).toLocaleString()}</td>
                  <td><span className={`status ${b.status}`}>{b.status}</span></td>
                  <td>{b.special_requests || '-'}</td>
                  <td>
                    {b.status === 'pending' && (
                      <button className="action-btn cancel" onClick={() => cancelBooking(b.id)}>
                        Cancel
                      </button>
                    )}
                    {b.status === 'confirmed' && (
                      <button className="action-btn complete" onClick={() => completeBooking(b.id)}>
                        Complete
                      </button>
                    )}
                    {(b.status === 'cancelled' || b.status === 'completed') && (
                      <span className="no-action">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
