import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await reportsAPI.getDashboard();
      setData(response.data?.data || response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  const { metrics, low_stock_alerts, recent_orders } = data;

  const statCards = [
    { name: 'Total Revenue', value: `$${Number(metrics.total_revenue).toFixed(2)}`, icon: CurrencyDollarIcon, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Total Orders', value: metrics.total_orders, icon: ShoppingBagIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Customers', value: metrics.total_customers, icon: UsersIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Today Orders', value: metrics.today_orders, icon: ShoppingBagIcon, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 hover:-translate-y-1 transition-transform duration-300">
            <div className={`p-4 rounded-2xl ${stat.bg}`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 font-medium border-b border-gray-100">
                  <th className="pb-3 px-4">Order ID</th>
                  <th className="pb-3 px-4">Customer</th>
                  <th className="pb-3 px-4">Amount</th>
                  <th className="pb-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent_orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                    <td className="py-4 px-4 font-medium text-gray-900">#{order.order_number || order.id}</td>
                    <td className="py-4 px-4 text-gray-600">{order.first_name} {order.last_name}</td>
                    <td className="py-4 px-4 font-medium text-gray-900">${Number(order.total_amount).toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recent_orders.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">No recent orders.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">Low Stock</h2>
          </div>
          <div className="space-y-4">
            {low_stock_alerts.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-4 rounded-2xl bg-red-50 border border-red-100">
                <div>
                  <p className="font-bold text-gray-900 line-clamp-1">{item.name}</p>
                  <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-600 font-bold">{item.stock_quantity} left</p>
                </div>
              </div>
            ))}
            {low_stock_alerts.length === 0 && (
              <div className="text-center p-8 text-gray-500">
                All products are well stocked.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
