import React, { useState } from 'react';
import AdminServiceManagement from '../components/AdminServiceManagement';
import AdminBookingsManagement from '../components/AdminBookingManagement';
import AdminAvailabilitySettings from '../components/AdminAvailabilitySettings';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('services');

  const tabs = [
    { id: 'services', label: 'Service Management' },
    { id: 'bookings', label: 'Bookings Management' },
    { id: 'availability', label: 'Availability Settings' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'services':
        return <AdminServiceManagement />;
      case 'bookings':
        return <AdminBookingsManagement />;
      case 'availability':
        return <AdminAvailabilitySettings />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 border-b-2'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default Admin;