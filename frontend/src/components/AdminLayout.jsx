import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChartBarIcon, 
  ShoppingBagIcon, 
  ClipboardDocumentListIcon,
  ArrowLeftOnRectangleIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const AdminLayout = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: ChartBarIcon, end: true },
    { name: 'Products', path: '/admin/products', icon: ShoppingBagIcon },
    { name: 'Orders', path: '/admin/orders', icon: ClipboardDocumentListIcon },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-[calc(100vh-4rem)]">
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-6 h-6" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-200 space-y-2">
          <NavLink
            to="/"
            className="flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <HomeIcon className="w-6 h-6" />
            <span>Back to Store</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium text-red-600 hover:bg-red-50"
          >
            <ArrowLeftOnRectangleIcon className="w-6 h-6" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
