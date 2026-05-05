import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ordersAPI } from '../services/api';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Truck, 
  CheckCircle,
  Clock,
  XCircle,
  Eye
} from 'lucide-react';

const Orders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      const ordersData = response.data?.data?.orders || response.data?.orders || response.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock style={{ width: '20px', height: '20px', color: '#eab308' }} />;
      case 'processing':
        return <Package style={{ width: '20px', height: '20px', color: '#3b82f6' }} />;
      case 'shipped':
        return <Truck style={{ width: '20px', height: '20px', color: '#9333ea' }} />;
      case 'delivered':
        return <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />;
      case 'cancelled':
        return <XCircle style={{ width: '20px', height: '20px', color: '#ef4444' }} />;
      default:
        return <Clock style={{ width: '20px', height: '20px', color: '#6b7280' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'processing':
        return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'shipped':
        return { backgroundColor: '#ede9fe', color: '#6d28d9' };
      case 'delivered':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'cancelled':
        return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#1f2937' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#212121', marginBottom: '8px' }}>{t('orderHistory')}</h1>
        <p style={{ color: '#525252' }}>{t('trackOrdersDesc')}</p>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <Package style={{ width: '96px', height: '96px', color: '#d1d5db', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#212121', marginBottom: '8px' }}>
            {t('noOrdersYet')}
          </h2>
          <p style={{ color: '#525252', marginBottom: '32px' }}>
            {t('noOrdersDesc')}
          </p>
          <button className="btn-primary">
            {t('startShopping')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '32px' }}>
          {/* Orders List */}
          <div style={{ gridColumn: 'span 2' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', padding: '24px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212121' }}>
                      Order #{order.id}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#525252' }}>
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '14px', fontWeight: '500', ...getStatusColor(order.status) }}>
                      {order.status}
                    </span>
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      style={{ padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                    >
                      <Eye style={{ width: '16px', height: '16px', color: '#525252' }} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Package style={{ width: '16px', height: '16px', color: '#525252' }} />
                      <span style={{ fontSize: '14px', color: '#525252' }}>
                        {order.items?.length || 0} items
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <DollarSign style={{ width: '16px', height: '16px', color: '#525252' }} />
                      <span style={{ fontSize: '14px', color: '#525252' }}>
                        ${order.total || order.totalAmount}
                      </span>
                    </div>
                  </div>
                  <button style={{ color: '#E53935', fontSize: '14px', fontWeight: '500', border: 'none', background: 'none', cursor: 'pointer' }}>
                    {t('trackOrder')}
                  </button>
                </div>

                {/* Expanded Order Details */}
                {selectedOrder?.id === order.id && (
                  <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                    <h4 style={{ fontWeight: '600', color: '#212121', marginBottom: '16px' }}>{t('orderItems')}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {order.items?.map((item, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <img
                            src={item.product?.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=50&h=50&fit=crop'}
                            alt={item.product?.name}
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                          />
                          <div style={{ flex: '1' }}>
                            <p style={{ fontWeight: '500', color: '#212121' }}>
                              {item.product?.name || 'Product'}
                            </p>
                            <p style={{ fontSize: '14px', color: '#525252' }}>
                              {t('qty')}: {item.quantity} × ${item.price}
                            </p>
                          </div>
                          <span style={{ fontWeight: '500', color: '#212121' }}>
                            ${(item.quantity * item.price).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Timeline */}
                    <div style={{ marginTop: '24px' }}>
                      <h4 style={{ fontWeight: '600', color: '#212121', marginBottom: '16px' }}>{t('orderTimeline')}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle style={{ width: '16px', height: '16px', color: '#166534' }} />
                          </div>
                          <div>
                            <p style={{ fontWeight: '500', color: '#212121' }}>{t('orderPlaced')}</p>
                            <p style={{ fontSize: '14px', color: '#525252' }}>{formatDate(order.createdAt)}</p>
                          </div>
                        </div>
                        
                        {order.status !== 'pending' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', backgroundColor: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Package style={{ width: '16px', height: '16px', color: '#1e40af' }} />
                            </div>
                            <div>
                              <p style={{ fontWeight: '500', color: '#212121' }}>{t('processing')}</p>
                              <p style={{ fontSize: '14px', color: '#525252' }}>{t('processingDesc')}</p>
                            </div>
                          </div>
                        )}
                        
                        {order.status === 'shipped' || order.status === 'delivered' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', backgroundColor: '#ede9fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Truck style={{ width: '16px', height: '16px', color: '#6d28d9' }} />
                            </div>
                            <div>
                              <p style={{ fontWeight: '500', color: '#212121' }}>{t('shipped')}</p>
                              <p style={{ fontSize: '14px', color: '#525252' }}>{t('shippedDesc')}</p>
                            </div>
                          </div>
                        ) : null}
                        
                        {order.status === 'delivered' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <CheckCircle style={{ width: '16px', height: '16px', color: '#166534' }} />
                            </div>
                            <div>
                              <p style={{ fontWeight: '500', color: '#212121' }}>{t('delivered')}</p>
                              <p style={{ fontSize: '14px', color: '#525252' }}>{t('deliveredDesc')}</p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div style={{ marginTop: '24px' }}>
                      <h4 style={{ fontWeight: '600', color: '#212121', marginBottom: '16px' }}>{t('shippingAddress')}</h4>
                      <div style={{ backgroundColor: '#fafafa', padding: '16px', borderRadius: '8px' }}>
                        <p style={{ color: '#212121' }}>
                          {order.shippingAddress?.street || '123 Main St'}
                        </p>
                        <p style={{ color: '#525252' }}>
                          {order.shippingAddress?.city || 'Kigali'}, {order.shippingAddress?.country || 'Rwanda'}
                        </p>
                        <p style={{ color: '#525252' }}>
                          {order.shippingAddress?.postalCode || 'KG 123 St'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Order Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('orderStatistics')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('totalOrders')}</span>
                  <span className="font-semibold">{orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('totalSpent')}</span>
                  <span className="font-semibold">
                    ${orders.reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('pendingOrders')}</span>
                  <span className="font-semibold">
                    {orders.filter(order => order.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('completedOrders')}</span>
                  <span className="font-semibold">
                    {orders.filter(order => order.status === 'delivered').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('quickActions')}</h3>
              <div className="space-y-3">
                <button className="w-full btn-secondary text-left">
                  {t('downloadInvoice')}
                </button>
                <button className="w-full btn-secondary text-left">
                  {t('contactSupport')}
                </button>
                <button className="w-full btn-secondary text-left">
                  {t('returnExchange')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
