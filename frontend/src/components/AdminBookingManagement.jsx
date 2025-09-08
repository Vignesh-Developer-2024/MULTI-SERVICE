import React, { useState, useEffect } from 'react';

const AdminBookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filters, setFilters] = useState({
    date: '',
    customer: '',
    service: '',
    status: ''
  });
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchBookings();
    fetchServices();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [filters, bookings]);

  const fetchBookings = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.date) queryParams.append('date', filters.date);
      if (filters.customer) queryParams.append('customer', filters.customer);
      if (filters.service) queryParams.append('service', filters.service);
      if (filters.status) queryParams.append('status', filters.status);

      const response = await fetch(`http://localhost:5000/api/bookings?${queryParams}`);
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (filters.date) {
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.date).toISOString().split('T')[0];
        return bookingDate === filters.date;
      });
    }

    if (filters.customer) {
      filtered = filtered.filter(booking => 
        booking.customer.name.toLowerCase().includes(filters.customer.toLowerCase()) ||
        booking.customer.email.toLowerCase().includes(filters.customer.toLowerCase())
      );
    }

    if (filters.service) {
      filtered = filtered.filter(booking => 
        booking.services.some(service => service.service._id === filters.service)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    setFilteredBookings(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchBookings();
      } else {
        console.error('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Bookings Management</h2>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <input
              type="text"
              name="customer"
              value={filters.customer}
              onChange={handleFilterChange}
              placeholder="Name or email"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select
              name="service"
              value={filters.service}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Services</option>
              {services.map(service => (
                <option key={service._id} value={service._id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Services
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map(booking => (
                <tr key={booking._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.customer.name}</div>
                    <div className="text-sm text-gray-500">{booking.customer.email}</div>
                    <div className="text-sm text-gray-500">{booking.customer.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {booking.services.map((item, index) => (
                        <div key={index}>
                          {item.quantity} x {item.service.name}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(booking.date)}</div>
                    <div className="text-sm text-gray-500">
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${booking.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                      className="border border-gray-300 rounded-md p-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredBookings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingsManagement;