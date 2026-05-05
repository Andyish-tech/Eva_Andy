import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
      setCartItems(guestCart);
      return;
    }

    try {
      setLoading(true);
      const response = await cartAPI.get();
      const itemsData = response.data?.data?.items || response.data?.items || response.data || [];
      setCartItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Sync guest cart to backend upon login
  useEffect(() => {
    const syncGuestCart = async () => {
      if (isAuthenticated) {
        const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
        if (guestCart.length > 0) {
          try {
            // Loop through and add each item to the user's account
            for (const item of guestCart) {
              await cartAPI.add({
                product_id: item.productId,
                quantity: item.quantity,
                price: item.price
              });
            }
            // Clear the guest cart
            localStorage.removeItem('guest_cart');
            // Re-fetch the cart from the server to get the merged result
            await fetchCart();
          } catch (err) {
            console.error('Failed to sync guest cart:', err);
          }
        }
      }
    };
    
    syncGuestCart();
  }, [isAuthenticated, fetchCart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product, quantity = 1) => {
    try {
      setLoading(true);
      
      if (isAuthenticated) {
        await cartAPI.add({
          product_id: product.id,
          quantity,
          price: product.price
        });
      }
      
      setCartItems(prev => {
        const existingItem = prev.find(item => item.productId === product.id);
        const newCartItems = existingItem
          ? prev.map(item =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          : [...prev, {
              productId: product.id,
              product,
              quantity,
              price: product.price
            }];
            
        if (!isAuthenticated) {
          localStorage.setItem('guest_cart', JSON.stringify(newCartItems));
        }
        return newCartItems;
      });
      
      toast.success('Product added to cart!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to cart';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    
    try {
      setLoading(true);
      
      if (isAuthenticated) {
        await cartAPI.update(productId, quantity);
      }
      
      setCartItems(prev => {
        const newCartItems = prev.map(item =>
          item.productId === productId
            ? { ...item, quantity }
            : item
        );
        if (!isAuthenticated) {
          localStorage.setItem('guest_cart', JSON.stringify(newCartItems));
        }
        return newCartItems;
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      
      if (isAuthenticated) {
        await cartAPI.remove(productId);
      }
      
      setCartItems(prev => {
        const newCartItems = prev.filter(item => item.productId !== productId);
        if (!isAuthenticated) {
          localStorage.setItem('guest_cart', JSON.stringify(newCartItems));
        }
        return newCartItems;
      });
      
      toast.success('Product removed from cart');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove from cart';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    if (!isAuthenticated) {
      localStorage.removeItem('guest_cart');
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    fetchCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
