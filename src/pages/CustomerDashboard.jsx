import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { FIXED_CATEGORIES } from '../constants/categories';
import { FiLogOut, FiCalendar, FiShoppingBag } from 'react-icons/fi';
import './CustomerDashboard.css';

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
    <div className="customer-dashboard">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Foodie Dashboard</h1>
          <p className="welcome-message">Welcome back, <span>{user?.email}</span></p>
        </div>
        
        <div className="dashboard-actions">
          <button className="action-btn bookings-btn" onClick={() => navigate('/customer-bookings')}>
            <FiCalendar className="btn-icon" /> My Bookings
          </button>
          <button className="action-btn logout-btn" onClick={() => navigate('/')}>
            <FiLogOut className="btn-icon" /> Logout
          </button>
        </div>
      </header>

      <div className="category-filters">
        <h2 className="section-title">Explore Catering Services</h2>
        <div className="category-grid">
          {servicesByCategory.map(category => (
            <div
              key={category.name}
              className={`category-card ${selectedCategory === category.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
            >
              <h3>{category.name}</h3>
              <p>{category.items.length} {category.items.length === 1 ? 'Service' : 'Services'}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedCategory && (
        <div className="services-section">
          <h2 className="section-title">{selectedCategory} Services</h2>
          <div className="services-grid">
            {services
              .filter(s => s.category?.toLowerCase() === selectedCategory.toLowerCase())
              .map(service => (
                <div key={service.id} className="service-card">
                  <div className="service-content">
                    <h3>{service.title}</h3>
                    <p className="service-description">{service.description}</p>
                    <p className="service-price">₱{service.price}</p>
                  </div>
                  <button 
                    className="book-now-btn"
                    onClick={() => navigate(`/book/${service.id}`)}
                  >
                    <FiShoppingBag className="btn-icon" /> Book Now
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}