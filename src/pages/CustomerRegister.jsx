import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

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
      password,
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

    alert('Customer registered successfully!');
    navigate('/login');
  };

  return (
    <>
    
    <form onSubmit={handleSubmit}>
      <h2>Customer Registration</h2>
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <input type="text" name="full_name" placeholder="Full Name" onChange={handleChange} required />
      <input type="text" name="address" placeholder="Address" onChange={handleChange} required />
      <input type="text" name="contact_number" placeholder="Contact Number" onChange={handleChange} required />
      <button type="submit">Register as Customer</button>
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
