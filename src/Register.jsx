// Register.jsx
import { supabase } from './supabaseClient';
import { useState } from 'react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // or 'seller'

  const handleRegister = async (e) => {
    e.preventDefault();
  
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
  
    if (authError) return alert(authError.message);
    const userId = authData.user.id;
  
    // Step 1: Insert into 'users'
    const { error: userInsertError } = await supabase
      .from('users')
      .insert({ id: userId, email, role });
  
    if (userInsertError) return alert(userInsertError.message);
  
    // Step 2: Insert into 'sellers' or 'customers'
    if (role === 'seller') {
      const { error: sellerError } = await supabase
        .from('sellers')
        .insert({
          id: userId,
          business_name,
          location,
          bio,
          contact_number,
        });
  
      if (sellerError) return alert(sellerError.message);
    } else {
      const { error: customerError } = await supabase
        .from('customers')
        .insert({
          id: userId,
          full_name,
          address,
          contact_number,
        });
  
      if (customerError) return alert(customerError.message);
    }
  
    alert('Registration successful!');
  };
  

  return (
    <form onSubmit={handleRegister}>
      <input type="email" onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" onChange={(e) => setPassword(e.target.value)} required />
      <select onChange={(e) => setRole(e.target.value)}>
        <option value="customer">Customer</option>
        <option value="seller">Seller</option>
      </select>
      <button type="submit">Register</button>
    </form>
  );
}
