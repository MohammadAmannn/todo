
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';
import { UserRole } from '../types';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">SecureTodo</span>
            </div>

            {user && (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-900">@{user.username}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                    user.role === UserRole.ADMIN ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {user.role}
                  </span>
                </div>
                
                <div className="h-8 w-px bg-slate-200"></div>

                <div className="flex gap-2">
                  <a href="#/" className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
                    Dashboard
                  </a>
                  {user.role === UserRole.ADMIN && (
                    <a href="#/admin" className="px-3 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors">
                      Admin
                    </a>
                  )}
                  <Button variant="outline" size="sm" onClick={logout} className="ml-2 !py-1.5 !px-3 text-xs">
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} Secure Todo App. Built with RBAC security.
      </footer>
    </div>
  );
};
