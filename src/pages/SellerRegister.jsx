import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

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
      password,
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
    <>
    <form onSubmit={handleSubmit}>
      <h2>Seller Registration</h2>
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <input type="text" name="business_name" placeholder="Business Name" onChange={handleChange} required />
      <input type="text" name="location" placeholder="Location" onChange={handleChange} required />
      <input type="text" name="contact_number" placeholder="Contact Number" onChange={handleChange} required />
      <textarea name="bio" placeholder="Bio" onChange={handleChange}></textarea>
      <button type="submit">Register as Seller</button>
    </form>

        <p style={{ marginTop: '1rem' }}>
            Already have an account?{' '}
            <button
                onClick={() => window.location.href = '/'}
                style={{
                background: 'none',
                border: 'none',
                color: '#007BFF',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0
                }}
            >
                Login instead
            </button>
            </p>

    </>
  );
}
