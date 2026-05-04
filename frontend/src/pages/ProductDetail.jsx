import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productsAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { 
  ShoppingCart, 
  Star, 
  Minus, 
  Plus, 
  ArrowLeft, 
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw
} from 'lucide-react';

const ProductDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (product && product.stock > 0) {
      await addToCart(product, quantity);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">{t('noProductsFound')}</p>
      </div>
    );
  }

  const images = [
    product.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        {t('backToProducts')}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex space-x-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square w-20 bg-gray-100 rounded-lg overflow-hidden border-2 ${
                  selectedImage === index ? 'border-blue-600' : 'border-transparent'
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                {renderStars(product.rating || 4)}
              </div>
              <span className="text-gray-600">
                ({product.reviews || 0} {t('reviews')})
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-blue-600">
                ${product.price}
              </span>
              {product.oldPrice && (
                <span className="text-xl text-gray-400 line-through">
                  ${product.oldPrice}
                </span>
              )}
              {product.discount && (
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                  -{product.discount}%
                </span>
              )}
            </div>
          </div>

          <div>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            {product.stock > 0 ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-600">
                  {t('inStock')} ({product.stock} {t('available')})
                </span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-600">{t('outOfStock')}</span>
              </>
            )}
          </div>

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="font-medium">{t('quantity')}:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 border-l border-r border-gray-300">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {t('addToCart')}
              </button>
              
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isWishlisted ? 'text-red-500 fill-current' : 'text-gray-400'
                  }`}
                />
              </button>
              
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Share2 className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Product Features */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Truck className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium">{t('freeDeliveryFeature')}</p>
                  <p className="text-sm text-gray-600">{t('freeDeliveryDesc')}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium">{t('securePayment')}</p>
                  <p className="text-sm text-gray-600">{t('securePaymentDesc2')}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium">{t('easyReturns')}</p>
                  <p className="text-sm text-gray-600">{t('easyReturnsDesc2')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-4">{t('productDetails')}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">SKU:</span>
                <span className="ml-2 font-medium">{product.sku || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">{t('category')}:</span>
                <span className="ml-2 font-medium">{product.category || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">{t('brand')}:</span>
                <span className="ml-2 font-medium">{product.brand || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">{t('weight')}:</span>
                <span className="ml-2 font-medium">{product.weight || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
