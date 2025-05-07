import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

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
    <div style={{ padding: 30 }}>
      {/* Go Back Button */}
     

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Manage Bookings</h1>
        <button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        ← Go Back
      </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label>Status Filter: </label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div style={{ display: 'grid', gap: 20 }}>
        {bookings.map(b => (
          <div
            key={b.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: 10,
              padding: 20,
              background: '#fafafa',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }}
          >
            <p><strong>Service:</strong> {b.catering_services?.title}</p>
            <p><strong>Customer:</strong> {b.customers?.full_name}</p>
            <p><strong>Status:</strong> {b.status}</p>
            <p><strong>Date:</strong> {new Date(b.booking_date).toLocaleString()}</p>
            {b.special_requests && <p><strong>Requests:</strong> {b.special_requests}</p>}

            {b.status === 'pending' && (
              <div style={{ marginTop: 10 }}>
                <button onClick={() => updateStatus(b.id, 'confirmed')}>Confirm</button>
                <button onClick={() => updateStatus(b.id, 'cancelled')} style={{ marginLeft: 10 }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
