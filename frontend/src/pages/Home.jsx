import React, { useState, useEffect } from 'react';
import ServiceCard from '../components/ServiceCard';
import CartDrawer from '../components/CardDrawer';
import SlotSelection from '../components/SlotSelection';
import CustomerDetails from '../components/CustomerDeteils';
import { useCart } from '../context/CartContext';

const Home = () => {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); 
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const { getTotalItems } = useCart();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async (search = '') => {
    try {
      const url = search 
        ? `http://localhost:5000/api/services?search=${encodeURIComponent(search)}`
        : 'http://localhost:5000/api/services';
      
      const response = await fetch(url);
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchServices(searchTerm);
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setCurrentStep(2);
  };

  const handleSlotSelected = (slot) => {
    setSelectedSlot(slot);
    setCurrentStep(3);
  };

  const handleBookingConfirmed = (booking) => {
    setBookingResult(booking);
    setCurrentStep(4);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="mb-8">
              <form onSubmit={handleSearch} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search services by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    fetchServices();
                  }}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Clear
                </button>
              </form>
            </div>

            <div className="mb-8 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Available Services</h2>
              <button
                onClick={() => setIsCartOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <span>Cart ({getTotalItems()})</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            </div>

            {services.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No matching services found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            )}
          </>
        );
      
      case 2:
        return (
          <SlotSelection
            onNext={handleSlotSelected}
            onBack={() => setCurrentStep(1)}
          />
        );
      
      case 3:
        return (
          <CustomerDetails
            slot={selectedSlot}
            onConfirm={handleBookingConfirmed}
            onBack={() => setCurrentStep(2)}
          />
        );
      
      case 4:
        return (
          <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">Thank you for your booking. We've sent a confirmation to your email.</p>
            <button
              onClick={() => {
                setCurrentStep(1);
                setBookingResult(null);
                setSelectedSlot(null);
              }}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Book Another Service
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {currentStep === 1 && (
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Multi-Service Booking</h1>
          <p className="text-lg text-gray-600">Book your favorite services with ease</p>
        </div>
      )}
      
      {renderStep()}
      
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceed={handleProceedToCheckout}
      />
    </div>
  );
};

export default Home;