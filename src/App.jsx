// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import CustomerRegister from './pages/CustomerRegister';
import SellerRegister from './pages/SellerRegister';
import CustomerDashboard from './pages/CustomerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import SellerBookings from './pages/SellerBookings';
import BookService from './pages/BookService';
import CustomerBookings from './pages/CustomerBookings';
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register/seller" element={<SellerRegister />} />
        <Route path="/register/customer" element={<CustomerRegister />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/seller-bookings" element={<SellerBookings />} />
        <Route path="/customer-bookings" element={<CustomerBookings />} />
        <Route path="/book/:serviceId" element={<BookService />} />

      </Routes>
    </Router>
  );
}
