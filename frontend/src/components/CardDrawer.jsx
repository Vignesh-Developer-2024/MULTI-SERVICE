import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const CartDrawer = ({ isOpen, onClose, onProceed }) => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleProceed = () => {
    setIsCheckingOut(true);
    onProceed();
    setIsCheckingOut(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="fixed inset-y-0 right-0 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
              <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Shopping cart</h2>
                  <button
                    type="button"
                    className="-mr-2 p-2 text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close panel</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-8">
                  <div className="flow-root">
                    <ul className="-my-6 divide-y divide-gray-200">
                      {cart.items.length === 0 ? (
                        <li className="py-6 flex justify-center">
                          <p className="text-gray-500">Your cart is empty</p>
                        </li>
                      ) : (
                        cart.items.map((item) => (
                          <li key={item.service._id} className="py-6 flex">
                            <div className="ml-4 flex-1 flex flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>{item.service.name}</h3>
                                  <p className="ml-4">${(item.service.price * item.quantity).toFixed(2)}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">{item.service.description}</p>
                              </div>
                              <div className="flex-1 flex items-end justify-between text-sm">
                                <div className="flex items-center">
                                  <button
                                    onClick={() => updateQuantity(item.service._id, item.quantity - 1)}
                                    className="px-2 py-1 border rounded-l-md"
                                  >
                                    -
                                  </button>
                                  <span className="px-4 py-1 border-t border-b">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.service._id, item.quantity + 1)}
                                    className="px-2 py-1 border rounded-r-md"
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.service._id)}
                                  className="font-medium text-red-600 hover:text-red-500"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Subtotal</p>
                  <p>${getTotalPrice().toFixed(2)}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                <div className="mt-6">
                  <button
                    onClick={handleProceed}
                    disabled={cart.items.length === 0 || isCheckingOut}
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isCheckingOut ? 'Processing...' : `Proceed to Checkout (${getTotalItems()} items)`}
                  </button>
                </div>
                <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                  <p>
                    or{' '}
                    <button
                      type="button"
                      className="text-blue-600 font-medium hover:text-blue-500"
                      onClick={onClose}
                    >
                      Continue Shopping<span aria-hidden="true"> &rarr;</span>
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;