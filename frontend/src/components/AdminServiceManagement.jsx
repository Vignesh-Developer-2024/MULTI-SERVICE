import React, { useState, useEffect } from 'react';

const AdminServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState({
    _id: '',
    name: '',
    description: '',
    price: '',
    duration: '',
    image: null
  });
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', currentService.name);
    formData.append('description', currentService.description);
    formData.append('price', currentService.price);
    formData.append('duration', currentService.duration);
    
    if (currentService.image && typeof currentService.image !== 'string') {
      formData.append('image', currentService.image);
    }

    try {
      const url = isEditing 
        ? `http://localhost:5000/api/services/${currentService._id}`
        : 'http://localhost:5000/api/services';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formData
      });
      
      if (response.ok) {
        setShowForm(false);
        setCurrentService({
          _id: '',
          name: '',
          description: '',
          price: '',
          duration: '',
          image: null
        });
        setImagePreview(null);
        setIsEditing(false);
        fetchServices();
      } else {
        console.error('Failed to save service');
      }
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleEdit = (service) => {
    setCurrentService({
      _id: service._id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      image: service.image
    });
    
    if (service.image) {
      setImagePreview(`http://localhost:5000/uploads/${service.image}`);
    } else {
      setImagePreview(null);
    }
    
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/services/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          fetchServices();
        } else {
          console.error('Failed to delete service');
        }
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentService(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentService(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const cancelEdit = () => {
    setShowForm(false);
    setCurrentService({
      _id: '',
      name: '',
      description: '',
      price: '',
      duration: '',
      image: null
    });
    setImagePreview(null);
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Service Management</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setIsEditing(false);
            setCurrentService({
              _id: '',
              name: '',
              description: '',
              price: '',
              duration: '',
              image: null
            });
            setImagePreview(null);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Add New Service
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {isEditing ? 'Edit Service' : 'Add New Service'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={currentService.name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={currentService.description}
                onChange={handleChange}
                required
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={currentService.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  value={currentService.duration}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-32 object-cover rounded-md"
                  />
                </div>
              )}
              {currentService.image && typeof currentService.image === 'string' && !imagePreview && (
                <div className="mt-2">
                  <img 
                    src={`http://localhost:5000/uploads/${currentService.image}`} 
                    alt="Current" 
                    className="h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                {isEditing ? 'Update Service' : 'Add Service'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map(service => (
                <tr key={service._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {service.image && (
                      <img
                        src={`http://localhost:5000/uploads/${service.image}`}
                        alt={service.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{service.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{service.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${service.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.duration} mins
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(service)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {services.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No services found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminServiceManagement;