import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const BookingSummary = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data);
      } else {
        console.error('Failed to fetch booking');
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Booking not found</div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-green-500 text-white p-6 text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-lg">Thank you for your booking. We've sent a confirmation to your email.</p>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Booking Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
              <div className="space-y-2">
                <p><strong>Name:</strong> {booking.customer.name}</p>
                <p><strong>Email:</strong> {booking.customer.email}</p>
                <p><strong>Phone:</strong> {booking.customer.phone}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Booking Details</h3>
              <div className="space-y-2">
                <p><strong>Booking ID:</strong> {booking._id}</p>
                <p><strong>Date:</strong> {formatDate(booking.date)}</p>
                <p><strong>Time:</strong> {booking.startTime} - {booking.endTime}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {booking.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Services Booked</h3>
            <div className="border border-gray-200 rounded-md">
              {booking.services.map((item, index) => (
                <div key={index} className="p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{item.service.name}</h4>
                      <p className="text-sm text-gray-600">{item.service.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.service.price} x {item.quantity}</p>
                      <p className="text-lg font-bold">${(item.service.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
            <h3 className="text-xl font-bold">Total Amount</h3>
            <p className="text-2xl font-bold text-green-600">${booking.totalPrice.toFixed(2)}</p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              We'll send you a reminder before your appointment. If you need to make any changes, please contact us.
            </p>
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Print Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;