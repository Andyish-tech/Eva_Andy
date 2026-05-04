import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productsAPI, categoriesAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Search, Star, Plus, ChevronRight, Home, ShoppingCart, User, Package, LogOut, Globe } from 'lucide-react';

const Products = () => {
  const { t, i18n } = useTranslation();
  const { addToCart, getCartCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
  });
  
  const cartCount = getCartCount();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      
      const response = await productsAPI.getAll(params.toString());
      setProducts(response.data.products || response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    setSearchParams(params);
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    await addToCart(product);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 text-gray-900 fill-current" />
        <span className="text-sm font-bold text-gray-900">{rating || '4.5'}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Shopping Sidebar (Search & Categories & Global Nav) */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              
              {/* Main Navigation Panel */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <Link to="/" className="flex items-center gap-3 mb-6 px-2">
                  <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">K</span>
                  </div>
                  <span className="text-xl font-bold text-primary-500 tracking-tight">KLEIN</span>
                </Link>
                
                <ul className="space-y-1">
                  <li>
                    <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-bold transition text-gray-600 hover:bg-gray-50">
                      <Home className="w-5 h-5 text-gray-400" />
                      {t('home')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/cart" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-bold transition text-gray-600 hover:bg-gray-50">
                      <ShoppingCart className="w-5 h-5 text-gray-400" />
                      {t('cart')}
                      {cartCount > 0 && (
                        <span className="ml-auto bg-primary-500 text-white text-xs px-2 py-1 rounded-full">{cartCount}</span>
                      )}
                    </Link>
                  </li>
                  {isAuthenticated ? (
                    <>
                      <li>
                        <Link to="/orders" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-bold transition text-gray-600 hover:bg-gray-50">
                          <Package className="w-5 h-5 text-gray-400" />
                          {t('orders')}
                        </Link>
                      </li>
                      <li>
                        <Link to="/profile" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-bold transition text-gray-600 hover:bg-gray-50">
                          <User className="w-5 h-5 text-gray-400" />
                          {t('profile')}
                        </Link>
                      </li>
                      <li>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-bold transition text-red-600 hover:bg-red-50">
                          <LogOut className="w-5 h-5 text-red-400" />
                          {t('logout')}
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link to="/login" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-bold transition text-gray-600 hover:bg-gray-50">
                          <User className="w-5 h-5 text-gray-400" />
                          {t('login')}
                        </Link>
                      </li>
                    </>
                  )}
                </ul>

                <div className="mt-4 pt-4 border-t border-gray-100 px-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
                    <Globe className="w-4 h-4" /> Lang
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => changeLanguage('en')}
                      className={`px-2 py-1 rounded-md text-xs font-bold ${i18n.language === 'en' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => changeLanguage('fr')}
                      className={`px-2 py-1 rounded-md text-xs font-bold ${i18n.language === 'fr' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                      FR
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Box */}
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('search') + "..."}
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-full text-gray-900 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition font-medium"
                  />
                </div>
              </div>

              {/* Categories Navigation */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg text-gray-900 mb-4 px-2">Categories</h3>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => handleFilterChange('category', '')}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left font-bold transition ${
                        !filters.category ? 'bg-primary-50 text-primary-500' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      All Products
                      {!filters.category && <ChevronRight className="w-5 h-5" />}
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => handleFilterChange('category', cat.name)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left font-bold transition ${
                          filters.category === cat.name ? 'bg-primary-50 text-primary-500' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {cat.name}
                        {filters.category === cat.name && <ChevronRight className="w-5 h-5" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            <div className="mb-6 hidden lg:block">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                {filters.category ? filters.category : 'All Products'}
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="loading-spinner"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 text-lg">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="group cursor-pointer flex flex-col bg-white p-4 rounded-3xl shadow-sm hover:shadow-float transition-all border border-gray-100"
                  >
                    {/* Image container */}
                    <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gray-50 mb-4">
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=400&fit=crop'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Floating Add to Cart Button */}
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={product.stock <= 0}
                        className="absolute bottom-3 right-3 bg-white text-gray-900 p-3 rounded-full shadow-lg hover:scale-110 hover:text-primary-500 transition-all disabled:opacity-50 disabled:hover:scale-100"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col px-1">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-900 truncate tracking-tight">{product.name}</h3>
                        <span className="font-bold text-gray-900">${product.price}</span>
                      </div>
                      
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3 font-medium">
                        {product.description}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        {renderStars(product.rating)}
                        {product.stock <= 0 && (
                          <span className="text-xs font-bold text-primary-500 bg-primary-50 px-3 py-1.5 rounded-lg">
                            {t('outOfStock')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
