
import React, { useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { api } from '../services/mockApi';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const { user, token } = await api.register(formData);
      login(user, token);
      window.location.hash = '#/';
    } catch (err: any) {
      setErrors({ form: err.message || 'Registration failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">T</div>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500 mt-1">Join SecureTodo today</p>
        </div>

        {errors.form && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input 
            label="Username"
            placeholder="Choose a username"
            value={formData.username}
            onChange={e => setFormData({ ...formData, username: e.target.value })}
            error={errors.username}
            required
          />
          <Input 
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            required
          />
          <Input 
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            required
          />

          <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
            Register
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Already have an account? {' '}
            <a href="#/login" className="text-indigo-600 font-semibold hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
