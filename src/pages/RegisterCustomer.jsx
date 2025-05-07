// src/pages/RegisterCustomer.jsx
import React, { useState } from 'react';
import { supabase } from '../supabase';
export default function RegisterCustomer() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    address: '',
    contact_number: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password
    });

    if (authError) return alert(authError.message);

    const userId = authData.user.id;

    // Insert into users table
    const { error: userInsertError } = await supabase
      .from('users')
      .insert({ id: userId, email: form.email, role: 'customer' });

    if (userInsertError) return alert(userInsertError.message);

    // Insert into customers table
    const { error: customerInsertError } = await supabase
      .from('customers')
      .insert({
        id: userId,
        full_name: form.full_name,
        address: form.address,
        contact_number: form.contact_number
      });

    if (customerInsertError) return alert(customerInsertError.message);

    alert('Customer registered successfully!');
    window.location.href = '/';
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register as Customer</h2>
      <input name="email" type="email" placeholder="Email" required onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" required onChange={handleChange} />
      <input name="full_name" type="text" placeholder="Full Name" required onChange={handleChange} />
      <input name="address" type="text" placeholder="Address" required onChange={handleChange} />
      <input name="contact_number" type="text" placeholder="Contact Number" required onChange={handleChange} />
      <button type="submit">Register</button>
    </form>
  );
}
