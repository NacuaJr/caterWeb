// CustomerDashboard.jsx

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { FIXED_CATEGORIES } from '../constants/categories';

export default function CustomerDashboard() {
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);

      const { data, error } = await supabase.from('catering_services').select('*');
      if (error) return alert(error.message);

      setServices(data);
    };

    fetchServices();
  }, []);

  const servicesByCategory = FIXED_CATEGORIES.map(cat => ({
    name: cat,
    items: services.filter(s => s.category?.toLowerCase() === cat.toLowerCase())
  }));

  return (
    <div style={{ padding: '30px' }}>
      <h1 style={{ marginBottom: 10 }}>Customer Dashboard</h1>
      <p style={{ marginBottom: 20 }}>Welcome, {user?.email}</p>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 20 }}>
        <button onClick={() => navigate('/customer-bookings')}>My Bookings</button>
        <button onClick={() => navigate('/')}>Logout</button>
      </div>

      {/* Category Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: 30 }}>
        {servicesByCategory.map(category => (
          <div
            key={category.name}
            style={{
              border: selectedCategory === category.name ? '3px solid #007bff' : '2px solid #ccc',
              padding: 20,
              borderRadius: 10,
              background: selectedCategory === category.name ? '#e6f0ff' : '#fff',
              cursor: 'pointer',
              width: '200px',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
            onClick={() =>
              setSelectedCategory(selectedCategory === category.name ? null : category.name)
            }
          >
            <h3>{category.name}</h3>
            <p>{category.items.length} service{category.items.length !== 1 ? 's' : ''}</p>
          </div>
        ))}
      </div>

      {/* Services Display */}
      {selectedCategory && (
        <div>
          <h2 style={{ marginBottom: 10 }}>{selectedCategory} Services</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {services
              .filter(s => s.category?.toLowerCase() === selectedCategory.toLowerCase())
              .map(service => (
                <div
                  key={service.id}
                  style={{
                    border: '1px solid #ddd',
                    padding: 20,
                    borderRadius: 8,
                    width: '300px',
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <p>
                    <strong>Price:</strong> ₱{service.price}
                  </p>
                  <button onClick={() => navigate(`/book/${service.id}`)}>Book Now</button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
