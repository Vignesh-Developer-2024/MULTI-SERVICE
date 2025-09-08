import React, { useState, useEffect } from 'react';

const AdminAvailabilitySettings = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [availability, setAvailability] = useState(null);
  const [workingHours, setWorkingHours] = useState([]);
  const [exceptions, setExceptions] = useState([]);

  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  const timeSlots = [
    '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30',
    '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      fetchAvailability();
    } else {
      setAvailability(null);
      setWorkingHours([]);
      setExceptions([]);
    }
  }, [selectedService]);

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/availability/service/${selectedService}`);
      if (response.status === 404) {
        initializeDefaultAvailability();
        return;
      }
      
      const data = await response.json();
      setAvailability(data);
      setWorkingHours(data.workingHours || []);
      setExceptions(data.exceptions || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const initializeDefaultAvailability = () => {
    const defaultWorkingHours = daysOfWeek.map(day => ({
      day,
      isAvailable: day !== 'sunday',
      slots: day !== 'sunday' ? [{ start: '09:00', end: '17:00' }] : []
    }));
    
    setWorkingHours(defaultWorkingHours);
    setExceptions([]);
    setAvailability(null);
  };

  const handleServiceChange = (e) => {
    setSelectedService(e.target.value);
  };

  const handleDayAvailabilityChange = (day, field, value) => {
    const updatedWorkingHours = workingHours.map(wh => 
      wh.day === day ? { ...wh, [field]: value } : wh
    );
    
    // If the day doesn't exist in workingHours, add it
    if (!updatedWorkingHours.find(wh => wh.day === day)) {
      updatedWorkingHours.push({
        day,
        isAvailable: field === 'isAvailable' ? value : true,
        slots: []
      });
    }
    
    setWorkingHours(updatedWorkingHours);
  };

  const handleSlotChange = (day, index, field, value) => {
    const updatedWorkingHours = workingHours.map(wh => {
      if (wh.day === day) {
        const updatedSlots = [...wh.slots];
        updatedSlots[index] = { ...updatedSlots[index], [field]: value };
        return { ...wh, slots: updatedSlots };
      }
      return wh;
    });
    
    setWorkingHours(updatedWorkingHours);
  };

  const addSlot = (day) => {
    const updatedWorkingHours = workingHours.map(wh => {
      if (wh.day === day) {
        return { ...wh, slots: [...wh.slots, { start: '09:00', end: '17:00' }] };
      }
      return wh;
    });
    
    setWorkingHours(updatedWorkingHours);
  };

  const removeSlot = (day, index) => {
    const updatedWorkingHours = workingHours.map(wh => {
      if (wh.day === day) {
        const updatedSlots = wh.slots.filter((_, i) => i !== index);
        return { ...wh, slots: updatedSlots };
      }
      return wh;
    });
    
    setWorkingHours(updatedWorkingHours);
  };

  const addException = () => {
    setExceptions([...exceptions, {
      date: new Date().toISOString().split('T')[0],
      isAvailable: false,
      slots: []
    }]);
  };

  const handleExceptionChange = (index, field, value) => {
    const updatedExceptions = [...exceptions];
    updatedExceptions[index] = { ...updatedExceptions[index], [field]: value };
    setExceptions(updatedExceptions);
  };

  const handleExceptionSlotChange = (index, slotIndex, field, value) => {
    const updatedExceptions = [...exceptions];
    if (!updatedExceptions[index].slots) {
      updatedExceptions[index].slots = [];
    }
    
    if (!updatedExceptions[index].slots[slotIndex]) {
      updatedExceptions[index].slots[slotIndex] = { start: '09:00', end: '17:00' };
    } else {
      updatedExceptions[index].slots[slotIndex] = {
        ...updatedExceptions[index].slots[slotIndex],
        [field]: value
      };
    }
    
    setExceptions(updatedExceptions);
  };

  const addExceptionSlot = (index) => {
    const updatedExceptions = [...exceptions];
    if (!updatedExceptions[index].slots) {
      updatedExceptions[index].slots = [];
    }
    updatedExceptions[index].slots.push({ start: '09:00', end: '17:00' });
    setExceptions(updatedExceptions);
  };

  const removeExceptionSlot = (index, slotIndex) => {
    const updatedExceptions = [...exceptions];
    updatedExceptions[index].slots = updatedExceptions[index].slots.filter((_, i) => i !== slotIndex);
    setExceptions(updatedExceptions);
  };

  const removeException = (index) => {
    setExceptions(exceptions.filter((_, i) => i !== index));
  };

  const saveAvailability = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/availability/service/${selectedService}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workingHours,
          exceptions
        })
      });

      if (response.ok) {
        alert('Availability saved successfully!');
        fetchAvailability(); // Refresh the data
      } else {
        alert('Failed to save availability');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Error saving availability');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Availability Settings</h2>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Service</label>
          <select
            value={selectedService}
            onChange={handleServiceChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a service</option>
            {services.map(service => (
              <option key={service._id} value={service._id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedService && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Regular Working Hours</h3>
            
            {daysOfWeek.map(day => {
              const dayAvailability = workingHours.find(wh => wh.day === day) || {
                day,
                isAvailable: day !== 'sunday',
                slots: []
              };

              return (
                <div key={day} className="mb-6 p-4 border border-gray-200 rounded-md">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium capitalize">{day}</h4>
                    <div className="flex items-center">
                      <label className="mr-2">Available</label>
                      <input
                        type="checkbox"
                        checked={dayAvailability.isAvailable}
                        onChange={(e) => handleDayAvailabilityChange(day, 'isAvailable', e.target.checked)}
                        className="h-5 w-5 text-blue-600"
                      />
                    </div>
                  </div>

                  {dayAvailability.isAvailable && (
                    <div>
                      <div className="mb-2">
                        <button
                          onClick={() => addSlot(day)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                        >
                          Add Time Slot
                        </button>
                      </div>

                      {dayAvailability.slots.map((slot, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <select
                            value={slot.start}
                            onChange={(e) => handleSlotChange(day, index, 'start', e.target.value)}
                            className="p-1 border border-gray-300 rounded-md"
                          >
                            {timeSlots.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <span>to</span>
                          <select
                            value={slot.end}
                            onChange={(e) => handleSlotChange(day, index, 'end', e.target.value)}
                            className="p-1 border border-gray-300 rounded-md"
                          >
                            {timeSlots.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeSlot(day, index)}
                            className="px-2 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Exceptions</h3>
              <button
                onClick={addException}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Exception
              </button>
            </div>

            {exceptions.map((exception, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-medium">Exception #{index + 1}</h4>
                  <button
                    onClick={() => removeException(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={exception.date}
                      onChange={(e) => handleExceptionChange(index, 'date', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <label className="mr-2">Available</label>
                    <input
                      type="checkbox"
                      checked={exception.isAvailable}
                      onChange={(e) => handleExceptionChange(index, 'isAvailable', e.target.checked)}
                      className="h-5 w-5 text-blue-600"
                    />
                  </div>
                </div>

                {exception.isAvailable && (
                  <div>
                    <div className="mb-2">
                      <button
                        onClick={() => addExceptionSlot(index)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                      >
                        Add Time Slot
                      </button>
                    </div>

                    {exception.slots && exception.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex items-center space-x-2 mb-2">
                        <select
                          value={slot.start}
                          onChange={(e) => handleExceptionSlotChange(index, slotIndex, 'start', e.target.value)}
                          className="p-1 border border-gray-300 rounded-md"
                        >
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                        <span>to</span>
                        <select
                          value={slot.end}
                          onChange={(e) => handleExceptionSlotChange(index, slotIndex, 'end', e.target.value)}
                          className="p-1 border border-gray-300 rounded-md"
                        >
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeExceptionSlot(index, slotIndex)}
                          className="px-2 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveAvailability}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Save Availability
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAvailabilitySettings;