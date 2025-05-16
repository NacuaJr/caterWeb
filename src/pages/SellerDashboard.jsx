import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { FIXED_CATEGORIES } from '../constants/categories';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiLogOut, FiCalendar } from 'react-icons/fi';
import './SellerDashboard.css';

export default function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    id: null,
    title: '',
    description: '',
    price: '',
    category: 'Wedding',
    availability: {}
  });

  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert(error.message);
    else window.location.href = '/'; // or navigate to your login page
  };

  useEffect(() => {
    const fetchServices = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);
      const { data, error } = await supabase
        .from('catering_services')
        .select('*')
        .eq('seller_id', userData.user.id);
      if (error) return alert(error.message);
      setServices(data);
    };

    fetchServices();
  }, [showModal]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      id: null,
      title: '',
      description: '',
      price: '',
      category: 'Wedding',
      availability: {}
    });
    setEditMode(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      availability: {},
      seller_id: user.id
    };

    let result;
    if (editMode) {
      result = await supabase
        .from('catering_services')
        .update(payload)
        .eq('id', form.id);
    } else {
      result = await supabase
        .from('catering_services')
        .insert(payload);
    }

    if (result.error) alert(result.error.message);
    else {
      resetForm();
      setShowModal(false);
    }
  };

  const handleEdit = (service) => {
    setForm(service);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this service?');
    if (!confirm) return;

    const { error } = await supabase
      .from('catering_services')
      .delete()
      .eq('id', id);

    if (error) alert(error.message);
    else setServices(prev => prev.filter(s => s.id !== id));
  };

  const servicesByCategory = FIXED_CATEGORIES.map(cat => ({
    name: cat,
    items: services.filter(s => s.category === cat)
  }));

  return (
    <div className="seller-dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">My Catering Business</h1>
        <div className="dashboard-actions">
          <button className="action-btn bookings-btn" onClick={() => navigate('/seller-bookings')}>
            <FiCalendar className="btn-icon" /> Bookings
          </button>
          <button className="action-btn logout-btn" onClick={handleLogout}>
            <FiLogOut className="btn-icon" /> Logout
          </button>
        </div>
      </header>

      <div className="dashboard-controls">
        <button className="primary-btn" onClick={() => { resetForm(); setShowModal(true); }}>
          <FiPlus className="btn-icon" /> Add New Service/Menu        
        </button>
      </div>

      <div className="category-grid">
        {servicesByCategory.map(category => (
          <div
            key={category.name}
            className={`category-card ${selectedCategory === category.name ? 'active' : ''}`}
            onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
          >
            <h3 className="category-name">{category.name}</h3>
            <p className="service-count">{category.items.length} {category.items.length === 1 ? 'Service' : 'Services'}</p>
          </div>
        ))}
      </div>

      {selectedCategory && (
        <div className="services-section">
          <h2 className="section-title">{selectedCategory} Services</h2>
          <div className="services-grid">
            {services
              .filter(s => s.category === selectedCategory)
              .map(service => (
                <div key={service.id} className="service-card">
                  <div className="service-content">
                    <h3 className="service-title">{service.title}</h3>
                    <p className="service-description">{service.description}</p>
                    <p className="service-price">₱{parseFloat(service.price).toFixed(2)}</p>
                  </div>
                  <div className="service-actions">
                    <button className="edit-btn" onClick={() => handleEdit(service)}>
                      <FiEdit2 /> Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(service.id)}>
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">{editMode ? 'Edit Service' : 'Create New Service'}</h2>
            <form onSubmit={handleSubmit} className="service-form">
              <div className="form-group">
                <label>Service Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Premium Wedding Package"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your service..."
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₱)</label>
                  <input
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    {FIXED_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editMode ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}