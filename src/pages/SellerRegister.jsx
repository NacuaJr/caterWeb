import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import './SellerRegister.css';

export default function SellerRegister() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    business_name: '',
    location: '',
    contact_number: '',
    bio: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password, business_name, location, contact_number, bio } = form;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) return alert(authError.message);

    const userId = authData.user.id;

    const { error: insertUserError } = await supabase.from('users').insert({
      id: userId,
      email,
      role: 'seller'
    });

    if (insertUserError) return alert(insertUserError.message);

    const { error: insertSellerError } = await supabase.from('sellers').insert({
      id: userId,
      business_name,
      location,
      contact_number,
      bio
    });

    if (insertSellerError) return alert(insertSellerError.message);

    alert('Seller registered successfully!');
    navigate('/login');
  };

  return (
    <div className="food-register-container">
      <form onSubmit={handleSubmit} className="food-register-form">
        <h2 className="food-register-title">Register Your Food Business</h2>
        
        <input
          type="email"
          name="email"
          placeholder="Business Email"
          onChange={handleChange}
          required
          className="food-input"
        />
        
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className="food-input"
        />
        
        <input
          type="text"
          name="business_name"
          placeholder="Business Name"
          onChange={handleChange}
          required
          className="food-input"
        />
        
        <input
          type="text"
          name="location"
          placeholder="Business Location"
          onChange={handleChange}
          required
          className="food-input"
        />
        
        <input
          type="text"
          name="contact_number"
          placeholder="Contact Number"
          onChange={handleChange}
          required
          className="food-input"
        />
        
        <textarea
          name="bio"
          placeholder="Tell us about your food business..."
          onChange={handleChange}
          className="food-textarea"
        ></textarea>

        <button type="submit" className="food-register-button">
          Register Business
        </button>

        <p className="food-login-prompt">
          Already have an account?{' '}
          <button 
            type="button"
            onClick={() => window.location.href = '/'}
            className="food-login-link"
          >
            Sign In Here
          </button>
        </p>
      </form>
    </div>
  );
}