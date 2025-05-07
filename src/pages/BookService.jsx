// src/pages/BookService.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

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

    // Fetch customer ID from customers table
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

  if (!service) return <p>Loading service...</p>;

  return (
    <div>
      <h2>Book: {service.title}</h2>
      <form onSubmit={handleBooking}>
        <div>
          <label>Booking Date:</label><br />
          <input
            type="datetime-local"
            name="booking_date"
            value={form.booking_date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Special Requests:</label><br />
          <textarea
            name="special_requests"
            value={form.special_requests}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Confirm Booking</button>
      </form>
    </div>
  );
}
