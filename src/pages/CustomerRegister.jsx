import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import './CustomerRegister.css';

export default function CustomerRegister() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    address: '',
    contact_number: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password, full_name, address, contact_number } = form;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) return alert(authError.message);

    const userId = authData.user.id;

    const { error: insertUserError } = await supabase.from('users').insert({
      id: userId,
      email,
      role: 'customer'
    });

    if (insertUserError) return alert(insertUserError.message);

    const { error: insertCustomerError } = await supabase.from('customers').insert({
      id: userId,
      full_name,
      address,
      contact_number
    });

    if (insertCustomerError) return alert(insertCustomerError.message);

    alert('Registration successful!');
    navigate('/login');
  };

  return (
    <div className="food-register-container">
      <form onSubmit={handleSubmit} className="food-register-form">
        <h2 className="food-register-title">Create Your Foodie Account</h2>
        
        <input
          type="email"
          name="email"
          placeholder="Email"
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
          name="full_name"
          placeholder="Full Name"
          onChange={handleChange}
          required
          className="food-input"
        />
        
        <input
          type="text"
          name="address"
          placeholder="Delivery Address"
          onChange={handleChange}
          required
          className="food-input"
        />
        
        <input
          type="text"
          name="contact_number"
          placeholder="Phone Number"
          onChange={handleChange}
          required
          className="food-input"
        />

        <button type="submit" className="food-register-button">
          Join Our Food Community
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