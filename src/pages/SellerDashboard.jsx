// src/pages/SellerDashboard.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { FIXED_CATEGORIES } from '../constants/categories';
import { useNavigate } from 'react-router-dom';

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
    const confirm = window.confirm('Delete this service?');
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
    
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Seller Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <button onClick={() => { resetForm(); setShowModal(true); }}>
        + Add Service
      </button>
      <button onClick={() => navigate('/seller-bookings')} style={{ marginRight: 10 }}>
      Manage Bookings
      </button>

      {/* Category Cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: 30 }}>
        {servicesByCategory.map(category => (
          <div
            key={category.name}
            style={{
              border: '2px solid #000',
              padding: 20,
              borderRadius: 10,
              background: '#fff',
              cursor: 'pointer',
              width: '200px',
              textAlign: 'center'
            }}
            onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
          >
            <h3>{category.name}</h3>
            <p>{category.items.length} services</p>
          </div>
        ))}
      </div>

      {/* Services Under Selected Category */}
      {selectedCategory && (
        <div style={{ marginTop: 30 }}>
          <h2>{selectedCategory} Services</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {services
              .filter(s => s.category === selectedCategory)
              .map(service => (
                <div key={service.id} style={{
                  border: '1px solid #ccc',
                  padding: 20,
                  borderRadius: 8,
                  width: '300px',
                  background: '#fafafa'
                }}>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <p>Price: ₱{service.price}</p>
                  <button onClick={() => handleEdit(service)}>Update</button>
                  <button onClick={() => handleDelete(service.id)} style={{ marginLeft: 10 }}>Delete</button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            background: '#fff', padding: 30, borderRadius: 10,
            width: '400px'
          }}>
            <h2>{editMode ? 'Edit Service' : 'New Service'}</h2>
            <form onSubmit={handleSubmit}>
              <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required /><br />
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required /><br />
              <input name="price" value={form.price} onChange={handleChange} placeholder="Price" type="number" step="0.01" required /><br />
              <select name="category" value={form.category} onChange={handleChange}>
                {FIXED_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select><br />
              <button type="submit">{editMode ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{ marginLeft: 10 }}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
