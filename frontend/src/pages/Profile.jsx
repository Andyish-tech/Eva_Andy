import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';
import { User, Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react';

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('firstName') + ' is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('lastName') + ' is required';
    }
    
    if (!formData.email) {
      newErrors.email = t('email') + ' is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone) {
      newErrors.phone = t('phone') + ' is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await usersAPI.updateProfile(formData);
      updateUser(response.data);
      setEditing(false);
      // Show success message (you can use toast here)
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setEditing(false);
    setErrors({});
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#212121', marginBottom: '8px' }}>{t('profile')}</h1>
          <p style={{ color: '#525252' }}>Manage your personal information and preferences</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '32px' }}>
          {/* Profile Card */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', padding: '24px', textAlign: 'center' }}>
              <div style={{ width: '96px', height: '96px', backgroundColor: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <User style={{ width: '48px', height: '48px', color: '#E53935' }} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#212121', marginBottom: '4px' }}>
                {user.firstName} {user.lastName}
              </h2>
              <p style={{ color: '#525252', marginBottom: '16px' }}>{user.email}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#525252' }}>
                <span style={{ backgroundColor: '#dcfce7', color: '#065f46', padding: '4px 8px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500' }}>
                  {user.role || 'Customer'}
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', padding: '24px', marginTop: '24px' }}>
              <h3 style={{ fontWeight: '600', color: '#212121', marginBottom: '16px' }}>Account Stats</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#525252' }}>Member Since</span>
                  <span style={{ fontWeight: '500' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#525252' }}>Total Orders</span>
                  <span style={{ fontWeight: '500' }}>{user.totalOrders || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#525252' }}>Total Spent</span>
                  <span style={{ fontWeight: '500' }}>${user.totalSpent || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#212121' }}>Personal Information</h3>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    style={{ display: 'flex', alignItems: 'center', color: '#E53935', cursor: 'pointer', border: 'none', background: 'none' }}
                  >
                    <Edit2 style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    Edit
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleCancel}
                      style={{ display: 'flex', alignItems: 'center', color: '#525252', cursor: 'pointer', border: 'none', background: 'none' }}
                    >
                      <X style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      style={{ display: 'flex', alignItems: 'center', color: '#E53935', cursor: loading ? 'default' : 'pointer', border: 'none', background: 'none', opacity: loading ? 0.5 : 1 }}
                    >
                      <Save style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                      Save
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '24px' }}>
                  <div>
                    <label htmlFor="firstName" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#212121', marginBottom: '4px' }}>
                      {t('firstName')}
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!editing}
                      style={{ width: '100%', padding: '8px 12px', border: errors.firstName ? '1px solid #dc2626' : '1px solid #d1d5db', borderRadius: '8px', outline: 'none', backgroundColor: !editing ? '#fafafa' : 'transparent' }}
                    />
                    {errors.firstName && (
                      <p style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626' }}>{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#212121', marginBottom: '4px' }}>
                      {t('lastName')}
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!editing}
                      style={{ width: '100%', padding: '8px 12px', border: errors.lastName ? '1px solid #dc2626' : '1px solid #d1d5db', borderRadius: '8px', outline: 'none', backgroundColor: !editing ? '#fafafa' : 'transparent' }}
                    />
                    {errors.lastName && (
                      <p style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626' }}>{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#212121', marginBottom: '4px' }}>
                    {t('email')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#525252', width: '20px', height: '20px' }} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!editing}
                      style={{ width: '100%', padding: '8px 12px 8px 40px', border: errors.email ? '1px solid #dc2626' : '1px solid #d1d5db', borderRadius: '8px', outline: 'none', backgroundColor: !editing ? '#fafafa' : 'transparent' }}
                    />
                  </div>
                  {errors.email && (
                    <p style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626' }}>{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#212121', marginBottom: '4px' }}>
                    {t('phone')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#525252', width: '20px', height: '20px' }} />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!editing}
                      style={{ width: '100%', padding: '8px 12px 8px 40px', border: errors.phone ? '1px solid #dc2626' : '1px solid #d1d5db', borderRadius: '8px', outline: 'none', backgroundColor: !editing ? '#fafafa' : 'transparent' }}
                    />
                  </div>
                  {errors.phone && (
                    <p style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626' }}>{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="address" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#212121', marginBottom: '4px' }}>
                    Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#525252', width: '20px', height: '20px' }} />
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!editing}
                      rows={3}
                      style={{ width: '100%', padding: '8px 12px 8px 40px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', backgroundColor: !editing ? '#fafafa' : 'transparent' }}
                    />
                  </div>
                </div>
              </form>

              {/* Additional Settings */}
              <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', padding: '24px', marginTop: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#212121', marginBottom: '24px' }}>Preferences</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: '500', color: '#212121' }}>Email Notifications</p>
                      <p style={{ fontSize: '14px', color: '#525252' }}>Receive order updates and promotional emails</p>
                    </div>
                    <button style={{ position: 'relative', display: 'inline-flex', height: '24px', width: '44px', alignItems: 'center', borderRadius: '9999px', backgroundColor: '#E53935' }}>
                      <span style={{ display: 'inline-block', height: '16px', width: '16px', transform: 'translateX(6px)', borderRadius: '9999px', backgroundColor: 'white', transition: 'transform 0.2s' }}></span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: '500', color: '#212121' }}>SMS Notifications</p>
                      <p style={{ fontSize: '14px', color: '#525252' }}>Get order status via text message</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1"></span>
                    </button>
              </div>
            </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
