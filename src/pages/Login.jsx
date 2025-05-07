import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { FaUtensils, FaUserTie, FaUser } from 'react-icons/fa';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null); // Clear error when user types
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Attempting login with:', form.email); // Debug log

      // First attempt to sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      });

      if (authError) {
        console.error('Login error:', authError); // Debug log
        throw authError;
      }

      console.log('Auth successful, user ID:', authData.user.id); // Debug log

      // Fetch user role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        console.error('Role fetch error:', userError); // Debug log
        throw userError;
      }

      console.log('User role:', userData.role); // Debug log

      // Redirect based on role
      if (userData.role === 'seller') {
        navigate('/seller');
      } else {
        navigate('/customer');
      }

    } catch (error) {
      console.error('Full error details:', error); // Debug log
      setError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="food-icon">
          <FaUtensils />
        </div>
        <h2 className="login-title">FeastBook</h2>
        <p className="login-subtitle">Where Every Reservation Feels Like A Celebration</p>
        
        {error && (
          <div className="error-message" style={{
            color: '#e74c3c',
            backgroundColor: '#fadbd8',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              onChange={handleChange}
              className="login-input"
              value={form.email}
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              onChange={handleChange}
              className="login-input"
              value={form.password}
            />
          </div>
          
          <button 
            type="submit" 
            className="primary-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="divider">
          <span className="divider-text">New to FeastBook?</span>
        </div>

        <div className="button-group">
          <button 
            onClick={() => navigate('/register/customer')} 
            className="secondary-button"
            disabled={loading}
          >
            <FaUser style={{ marginRight: '8px' }} />
            Register as Customer
          </button>
          <button 
            onClick={() => navigate('/register/seller')} 
            className="secondary-button"
            disabled={loading}
          >
            <FaUserTie style={{ marginRight: '8px' }} />
            Register as Seller
          </button>
        </div>
      </div>
    </div>
  );
}