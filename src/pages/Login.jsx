// src/pages/Login.jsx
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password
    });

    if (authError) return alert(authError.message);

    const userId = authData.user.id;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError) return alert(userError.message);

    if (userData.role === 'seller') {
      navigate('/seller');
    } else {
      navigate('/customer');
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          onChange={handleChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          onChange={handleChange}
        />
        <button type="submit">Login</button>
      </form>


      <div>
        <button onClick={() => navigate('/register/customer')}>Register as Customer</button>
        <button onClick={() => navigate('/register/seller')} style={{ marginLeft: '10px' }}>
          Register as Seller
        </button>
      </div>
    </div>
  );
}
