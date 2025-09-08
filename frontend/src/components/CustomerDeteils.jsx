import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const CustomerDetails = ({ slot, onConfirm, onBack }) => {
  const { cart, getTotalPrice, clearCart } = useCart();
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value
    });
  
    if (error) setError('');
  };

  const validateForm = () => {
    if (!customer.name.trim()) {
      setError('Name is required');
      return false;
    }
    
    if (!customer.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(customer.email)) {
      setError('Email is invalid');
      return false;
    }
    
    if (!customer.phone.trim()) {
      setError('Phone is required');
      return false;
    }
    if (customer.phone.length !==10) {
      setError("Phone number must be 10 degit")
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const bookingData = {
        customer,
        services: cart.items.map(item => ({
          service: item.service._id,
          quantity: item.quantity
        })),
        date: slot.date,
        startTime: slot.time
      };
      
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        clearCart();
        onConfirm(data);
      } else {
      
        if (data.message.includes('Time slot already booked')) {
          setError('This time slot is already booked. Please choose another time.');
        } else if (data.message.includes('not available')) {
          setError('One or more services are not available at the selected time. Please choose another time.');
        } else if (data.message.includes('Availability not set')) {
          setError('Service availability is not configured. Please contact support.');
        } else {
          setError(data.message || 'Booking failed. Please try again.');
        }
        console.error('Booking failed:', data);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = customer.name && customer.email && customer.phone;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Customer Details</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
          <input
            type="text"
            name="name"
            value={customer.name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={customer.email}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
          <input
            type="tel"
            name="phone"
            value={customer.phone}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={isSubmitting}
            maxLength={10}
          />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-semibold mb-2">Booking Summary</h3>
          <p><strong>Date:</strong> {new Date(slot.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {slot.time}</p>
          <p><strong>Total:</strong> ${getTotalPrice().toFixed(2)}</p>
          
          <div className="mt-3">
            <h4 className="font-medium mb-1">Services:</h4>
            {cart.items.map((item, index) => (
              <div key={index} className="text-sm text-gray-600">
                {item.quantity} x {item.service.name} (${item.service.price} each)
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-400"
          >
            Back
          </button>
          
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerDetails;