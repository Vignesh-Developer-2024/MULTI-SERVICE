import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import Admin from './pages/Admin';
import BookingSummary from './pages/BookingSummary';
import './App.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/booking-summary/:bookingId" element={<BookingSummary />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;