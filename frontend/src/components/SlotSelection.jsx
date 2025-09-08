import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

const SlotSelection = ({ onNext, onBack }) => {
  const { cart } = useCart();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availabilityResults, setAvailabilityResults] = useState([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const checkAvailability = async () => {
    if (!selectedDate || !selectedTime) return;
    
    setIsChecking(true);
    try {
      const serviceIds = cart.items.map(item => item.service._id);
      const response = await fetch('http://localhost:5000/api/availability/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          services: serviceIds,
          date: selectedDate,
          startTime: selectedTime
        })
      });
      
      const results = await response.json();
      setAvailabilityResults(results);
      

      const allAvailable = results.every(result => result.available);
      if (allAvailable) {
        onNext({ date: selectedDate, time: selectedTime });
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const isNextDisabled = !selectedDate || !selectedTime || isChecking;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Select Date & Time</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
        <input
          type="time"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      
      {availabilityResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Availability Status</h3>
          {availabilityResults.map((result, index) => (
            <div
              key={index}
              className={`p-3 mb-2 rounded-md ${
                result.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              <p className="font-medium">
                {cart.items.find(item => item.service._id === result.service)?.service.name}
              </p>
              <p>{result.available ? 'Available' : `Not Available: ${result.reason}`}</p>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Back
        </button>
        
        <div className="flex space-x-4">
          <button
            onClick={checkAvailability}
            disabled={isNextDisabled}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isChecking ? 'Checking...' : 'Check Availability'}
          </button>
          
          <button
            onClick={() => onNext({ date: selectedDate, time: selectedTime })}
            disabled={isNextDisabled || availabilityResults.some(result => !result.available)}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlotSelection;