
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TodoFormPage } from './pages/TodoFormPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserRole } from './types';

const Router: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium animate-pulse">Initializing Secure Session...</p>
        </div>
      </div>
    );
  }

  // Auth Protection Logic
  const publicRoutes = ['#/login', '#/register'];
  const isPublicRoute = publicRoutes.includes(hash);

  if (!user && !isPublicRoute) {
    window.location.hash = '#/login';
    return null;
  }

  if (user && isPublicRoute) {
    window.location.hash = '#/';
    return null;
  }

  // Routing Logic
  const renderContent = () => {
    const path = hash || '#/';

    if (path === '#/login') return <LoginPage />;
    if (path === '#/register') return <RegisterPage />;
    if (path === '#/') return <DashboardPage />;
    if (path === '#/todo/new') return <TodoFormPage />;
    if (path.startsWith('#/todo/edit/')) {
      const id = path.split('/').pop();
      return <TodoFormPage editId={id} />;
    }
    if (path === '#/admin') {
      if (user?.role !== UserRole.ADMIN) {
        window.location.hash = '#/';
        return null;
      }
      return <AdminDashboard />;
    }

    return <DashboardPage />;
  };

  return <Layout>{renderContent()}</Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
};

export default App;
