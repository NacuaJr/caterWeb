// src/pages/BookService.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './BookService.css';

export default function BookService() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [service, setService] = useState(null);
  const [form, setForm] = useState({
    booking_date: '',
    special_requests: ''
  });

  useEffect(() => {
    const fetchDetails = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);

      const { data, error } = await supabase
        .from('catering_services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (error) return alert(error.message);
      setService(data);
    };

    fetchDetails();
  }, [serviceId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!customer) return alert("Customer not found!");

    const { error } = await supabase.from('bookings').insert({
      service_id: serviceId,
      customer_id: customer.id,
      seller_id: service.seller_id,
      booking_date: new Date(form.booking_date),
      special_requests: form.special_requests
    });

    if (error) return alert(error.message);

    alert('Booking submitted!');
    navigate('/customer');
  };

  if (!service) return <p className="loading-text">Loading service...</p>;

  return (
    <div className="book-container">
      <h2 className="book-title">Book Service</h2>
      <div className="service-details">
        <h3>{service.title}</h3>
        <p>{service.description}</p>
        <p><strong>Price:</strong> ₱{service.price}</p>
      </div>

      <form className="booking-form" onSubmit={handleBooking}>
        <div className="form-group">
          <label>Booking Date:</label>
          <input
            type="datetime-local"
            name="booking_date"
            value={form.booking_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Special Requests:</label>
          <textarea
            name="special_requests"
            value={form.special_requests}
            onChange={handleChange}
            placeholder="Any preferences or requests..."
          />
        </div>

        <button type="submit" className="primary-btn">Confirm Booking</button>
      </form>
    </div>
  );
}
