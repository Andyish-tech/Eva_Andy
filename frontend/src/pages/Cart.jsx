import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Plus, Minus, Trash2, ShieldCheck, ChevronRight } from 'lucide-react';

const Cart = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, loading } = useCart();
  const { isAuthenticated } = useAuth();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-white">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
          Your cart is empty
        </h2>
        <p className="text-gray-500 mb-8 font-medium">
          Add items to get started
        </p>
        <Link
          to="/products"
          className="bg-primary-500 text-white px-8 py-4 rounded-full font-bold inline-flex items-center hover:bg-primary-600 transition shadow-float"
        >
          {t('continueShopping')}
        </Link>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
                {/* Product Image */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                  <img
                    src={item.product?.image || 'https://images.unsplash.com/photo-1441986309857-5d9b9866533?w=200&h=200&fit=crop'}
                    alt={item.product?.name || 'Product'}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg tracking-tight mb-1">
                        {item.product?.name || 'Product'}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium line-clamp-1 mb-2">
                        {item.product?.description}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900 text-lg">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center bg-gray-100 rounded-full p-1">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-900 hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-gray-50 rounded-[2rem] p-6 lg:p-8 sticky top-24 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Order Summary</h2>
              
              <div className="space-y-4 mb-6 font-medium">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-primary-500 font-bold">Free</span>
                    ) : (
                      <span className="text-gray-900">${shipping.toFixed(2)}</span>
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Taxes & Fees</span>
                  <span className="text-gray-900">${tax.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white py-4 px-6 rounded-full font-bold text-lg transition shadow-lg"
              >
                Checkout <ChevronRight className="w-5 h-5" />
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-gray-500">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>Secure encrypted checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
