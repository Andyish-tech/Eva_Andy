import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, User, Menu, X, Globe, LogOut, Package, Search } from 'lucide-react';

const Navbar = ({ changeLanguage }) => {
  const { t, i18n } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;
  const cartCount = getCartCount();

  if (location.pathname === '/products') return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-white z-50 border-b border-gray-200 shadow-sm flex items-center justify-between px-4 lg:px-8">
        
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg lg:text-xl">K</span>
            </div>
            <span className="text-xl lg:text-2xl font-bold text-primary-500 tracking-tight hidden sm:block">KLEIN</span>
          </Link>
        </div>

        {/* Center: Search (Hidden on small mobile) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-gray-100 border-transparent rounded-full text-gray-900 placeholder-gray-500 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-200 outline-none transition-colors sm:text-sm font-medium"
            placeholder={t('search') + " products..."}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Language Selector Desktop */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors font-medium"
            >
              <Globe className="w-5 h-5" />
              <span>{i18n.language === 'en' ? 'EN' : 'FR'}</span>
            </button>
            {isLangMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-float border border-gray-100 py-2 z-50">
                <button
                  onClick={() => { changeLanguage('en'); setIsLangMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium ${i18n.language === 'en' ? 'text-primary-500' : 'text-gray-700'}`}
                >
                  English
                </button>
                <button
                  onClick={() => { changeLanguage('fr'); setIsLangMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium ${i18n.language === 'fr' ? 'text-primary-500' : 'text-gray-700'}`}
                >
                  Français
                </button>
              </div>
            )}
          </div>

          {/* User Auth */}
          {isAuthenticated ? (
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/orders"
                className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-full font-medium transition-colors"
              >
                {t('orders')}
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-full font-medium transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="truncate max-w-[100px]">{user?.firstName}</span>
              </Link>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <Link
                to="/login"
                className="text-gray-900 hover:bg-gray-100 px-5 py-2.5 rounded-full font-bold transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-full font-bold transition-colors"
              >
                {t('signUp')}
              </Link>
            </div>
          )}

          {/* Cart Button */}
          <Link
            to="/cart"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-colors ${
              cartCount > 0 
                ? 'bg-primary-500 hover:bg-primary-600 text-white' 
                : 'bg-gray-900 hover:bg-gray-800 text-white'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">{cartCount}</span>
          </Link>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Slide-out Menu */}
          <div className="absolute top-0 left-0 w-80 max-w-full h-full bg-white shadow-xl flex flex-col overflow-y-auto">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900">Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-lg font-medium text-gray-900 rounded-xl hover:bg-gray-50"
              >
                <Package className="w-5 h-5 text-gray-500" />
                {t('home')}
              </Link>
              <Link
                to="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-lg font-medium text-gray-900 rounded-xl hover:bg-gray-50"
              >
                <Search className="w-5 h-5 text-gray-500" />
                {t('products')}
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-lg font-medium text-gray-900 rounded-xl hover:bg-gray-50"
                  >
                    <Package className="w-5 h-5 text-gray-500" />
                    {t('orders')}
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-lg font-medium text-gray-900 rounded-xl hover:bg-gray-50"
                  >
                    <User className="w-5 h-5 text-gray-500" />
                    {t('profile')}
                  </Link>
                </>
              ) : null}
            </div>

            <div className="p-4 border-t border-gray-100 flex flex-col gap-3">
              {/* Language Selector Mobile */}
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <Globe className="w-5 h-5" />
                  Language
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`px-3 py-1 rounded-full text-sm font-bold ${i18n.language === 'en' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => changeLanguage('fr')}
                    className={`px-3 py-1 rounded-full text-sm font-bold ${i18n.language === 'fr' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    FR
                  </button>
                </div>
              </div>

              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="mt-2 flex items-center justify-center gap-2 w-full py-3 bg-gray-100 text-red-600 rounded-full font-bold hover:bg-gray-200 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  {t('logout')}
                </button>
              ) : (
                <div className="flex flex-col gap-2 mt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 bg-gray-100 text-gray-900 rounded-full font-bold text-center hover:bg-gray-200 transition-colors"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 bg-primary-500 text-white rounded-full font-bold text-center hover:bg-primary-600 transition-colors"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
