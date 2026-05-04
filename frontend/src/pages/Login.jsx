import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    if (!formData.email) {
      newErrors.email = 'Email is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const result = await login(formData);
      if (result.success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Sign In</h2>
          <p className="text-gray-500 mt-2 font-medium">Welcome back to KLEIN</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={`w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition font-medium ${
                errors.email ? 'ring-2 ring-primary-500' : ''
              }`}
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="mt-2 text-sm text-primary-500 font-medium pl-2">{errors.email}</p>}
          </div>

          <div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className={`w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition font-medium ${
                errors.password ? 'ring-2 ring-primary-500' : ''
              }`}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="mt-2 text-sm text-primary-500 font-medium pl-2">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 text-white py-4 rounded-full font-bold text-lg hover:bg-primary-600 hover:scale-105 transition-all duration-300 shadow-float disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600 font-medium">
          New to KLEIN?{' '}
          <Link to="/register" className="text-primary-500 hover:text-primary-600 font-bold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
