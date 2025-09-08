import React from 'react';
import { useCart } from '../context/CartContext';

const ServiceCard = ({ service }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(service);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      {service.image && (
        <img
          src={`http://localhost:5000/uploads/${service.image}`}
          alt={service.name}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.name}</h3>

        <p className="text-gray-600 mb-3 flex-1">{service.description}</p>

        <div className="mt-auto">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-bold text-blue-600">${service.price}</span>
            <span className="text-sm text-gray-500">{service.duration} mins</span>
          </div>
          <button
            onClick={handleAddToCart}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors duration-300"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
