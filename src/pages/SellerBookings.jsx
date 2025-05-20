import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import './SellerBookings.css';

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
        .select(`
          *,
          catering_services (title),
          customers (full_name)
        `)
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

      <div className="bookings-table-wrapper">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Customer</th>
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
                  <td>{b.catering_services?.title || 'N/A'}</td>
                  <td>{b.customers?.full_name || 'N/A'}</td>
                  <td>{new Date(b.booking_date).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${b.status}`}>{b.status}</span>
                  </td>
                  <td>{b.special_requests || '-'}</td>
                  <td>
                    {b.status === 'pending' && (
                      <div className="action-buttons">
                        <button className="confirm-btn" onClick={() => updateStatus(b.id, 'confirmed')}>
                          Confirm
                        </button>
                        <button className="cancel-btn" onClick={() => updateStatus(b.id, 'cancelled')}>
                          Cancel
                        </button>
                      </div>
                    )}
                    {b.status === 'confirmed' && (
                      <button className="complete-btn" onClick={() => updateStatus(b.id, 'completed')}>
                        Complete
                      </button>
                    )}
                    {(b.status === 'completed' || b.status === 'cancelled') && (
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
