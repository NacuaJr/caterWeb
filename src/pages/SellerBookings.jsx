import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import './SellerBookings.css'; // Import CSS

export default function SellerBookings() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const sellerId = userData.user.id;
      setUser(userData.user);

      let query = supabase
        .from('bookings')
        .select(`*, catering_services(title), customers(full_name)`)
        .eq('seller_id', sellerId);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) return alert(error.message);
      setBookings(data);
    };

    fetchBookings();
  }, [statusFilter]);

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) return alert(error.message);

    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h1 className="title">🍽️ Manage Bookings</h1>
        <button className="back-button" onClick={() => navigate(-1)}>← Go Back</button>
      </div>

      <div className="filter-section">
        <label>Status Filter: </label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="bookings-grid">
        {bookings.map(b => (
          <div key={b.id} className="booking-card">
            <p><strong>Service:</strong> {b.catering_services?.title}</p>
            <p><strong>Customer:</strong> {b.customers?.full_name}</p>
            <p>
              <strong>Status:</strong> 
              <span className={`status-badge ${b.status}`}>{b.status}</span>
            </p>
            <p><strong>Date:</strong> {new Date(b.booking_date).toLocaleString()}</p>
            {b.special_requests && (
              <p><strong>Requests:</strong> {b.special_requests}</p>
            )}

            {b.status === 'pending' && (
              <div className="action-buttons">
                <button className="confirm-btn" onClick={() => updateStatus(b.id, 'confirmed')}>Confirm</button>
                <button className="cancel-btn" onClick={() => updateStatus(b.id, 'cancelled')}>Cancel</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
