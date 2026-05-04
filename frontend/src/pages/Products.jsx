import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productsAPI, categoriesAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { Search, Filter, ShoppingCart, Star, Plus } from 'lucide-react';

const Products = () => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
  });
  
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

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 text-gray-900 fill-current" />
        <span className="text-sm font-bold text-gray-900">{rating || '4.5'}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Search Header */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 py-4 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder={t('search') + "..."}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-100 border-transparent rounded-full text-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-200 outline-none transition-colors font-medium"
              />
            </div>
          </div>
          
          {/* Horizontal Category Pills */}
          <div className="flex overflow-x-auto gap-3 py-4 mt-2 hide-scrollbar">
            <button
              onClick={() => handleFilterChange('category', '')}
              className={`flex-none px-6 py-2 rounded-full font-bold text-sm transition-colors ${
                !filters.category 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleFilterChange('category', cat.name)}
                className={`flex-none px-6 py-2 rounded-full font-bold text-sm transition-colors ${
                  filters.category === cat.name 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">
          {filters.category ? filters.category : t('products')}
        </h1>

        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="loading-spinner"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 text-lg">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                className="group cursor-pointer flex flex-col"
              >
                {/* Image container */}
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gray-100 mb-3 border border-gray-100">
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=400&fit=crop'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Floating Add to Cart Button */}
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={product.stock <= 0}
                    className="absolute bottom-3 right-3 bg-white text-gray-900 p-2 rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-900 truncate tracking-tight">{product.name}</h3>
                    <span className="font-medium text-gray-900">${product.price}</span>
                  </div>
                  
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2 font-medium">
                    {product.description}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    {renderStars(product.rating)}
                    {product.stock <= 0 && (
                      <span className="text-xs font-bold text-primary-500 bg-primary-50 px-2 py-1 rounded-md">
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
  );
};

export default Products;
