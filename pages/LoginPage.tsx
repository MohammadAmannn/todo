
import React, { useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { api } from '../services/mockApi';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ credential: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { user, token } = await api.login(formData.credential, formData.password);
      login(user, token);
      window.location.hash = '#/';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">T</div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 mt-1">Please sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input 
            label="Email or Username"
            placeholder="Enter your email or username"
            value={formData.credential}
            onChange={e => setFormData({ ...formData, credential: e.target.value })}
            required
          />
          <Input 
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account? {' '}
            <a href="#/register" className="text-indigo-600 font-semibold hover:underline">
              Register now
            </a>
          </p>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-xs text-indigo-700 leading-relaxed">
        <p className="font-bold mb-1">Testing Admin Account:</p>
        <p>Credential: <span className="font-mono">admin</span></p>
        <p>Password: <span className="font-mono">password123</span></p>
      </div>
    </div>
  );
};
