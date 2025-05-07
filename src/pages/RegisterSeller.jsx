// src/pages/RegisterSeller.jsx
import React, { useState } from 'react';
import { supabase } from '../supabase';
export default function RegisterSeller() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    business_name: '',
    location: '',
    bio: '',
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
      .insert({ id: userId, email: form.email, role: 'seller' });

    if (userInsertError) return alert(userInsertError.message);

    // Insert into sellers table
    const { error: sellerInsertError } = await supabase
      .from('sellers')
      .insert({
        id: userId,
        business_name: form.business_name,
        location: form.location,
        bio: form.bio,
        contact_number: form.contact_number
      });

    if (sellerInsertError) return alert(sellerInsertError.message);

    alert('Seller registered successfully!');
    window.location.href = '/';
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register as Seller</h2>
      <input name="email" type="email" placeholder="Email" required onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" required onChange={handleChange} />
      <input name="business_name" type="text" placeholder="Business Name" required onChange={handleChange} />
      <input name="location" type="text" placeholder="Location" required onChange={handleChange} />
      <input name="bio" type="text" placeholder="Bio" onChange={handleChange} />
      <input name="contact_number" type="text" placeholder="Contact Number" required onChange={handleChange} />
      <button type="submit">Register</button>
    </form>
  );
}
