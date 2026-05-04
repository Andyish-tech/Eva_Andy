import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { confirmPassword, ...dataToSend } = formData;
      const result = await register(dataToSend);
      if (result.success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-white px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create an account</h2>
          <p className="text-gray-500 mt-2 font-medium">Join KLEIN to start shopping</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                name="firstName"
                type="text"
                required
                className={`w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition font-medium ${errors.firstName ? 'ring-2 ring-primary-500' : ''}`}
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <p className="mt-1 text-xs text-primary-500 font-medium pl-2">{errors.firstName}</p>}
            </div>
            <div>
              <input
                name="lastName"
                type="text"
                required
                className={`w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition font-medium ${errors.lastName ? 'ring-2 ring-primary-500' : ''}`}
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && <p className="mt-1 text-xs text-primary-500 font-medium pl-2">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <input
              name="email"
              type="email"
              required
              className={`w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition font-medium ${errors.email ? 'ring-2 ring-primary-500' : ''}`}
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="mt-1 text-xs text-primary-500 font-medium pl-2">{errors.email}</p>}
          </div>

          <div>
            <input
              name="password"
              type="password"
              required
              className={`w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition font-medium ${errors.password ? 'ring-2 ring-primary-500' : ''}`}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="mt-1 text-xs text-primary-500 font-medium pl-2">{errors.password}</p>}
          </div>

          <div>
            <input
              name="confirmPassword"
              type="password"
              required
              className={`w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition font-medium ${errors.confirmPassword ? 'ring-2 ring-primary-500' : ''}`}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-primary-500 font-medium pl-2">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 text-white py-4 rounded-full font-bold text-lg hover:bg-primary-600 transition shadow-float disabled:opacity-70 flex justify-center items-center mt-6"
          >
            {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Sign Up'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 hover:text-primary-600 font-bold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
