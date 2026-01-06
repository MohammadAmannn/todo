
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    const storedSession = localStorage.getItem('todo_app_session');
    if (storedSession) {
      try {
        const { user, token } = JSON.parse(storedSession);
        setState({ user, token, isLoading: false });
      } catch (e) {
        localStorage.removeItem('todo_app_session');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = (user: User, token: string) => {
    const session = { user, token };
    localStorage.setItem('todo_app_session', JSON.stringify(session));
    setState({ user, token, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem('todo_app_session');
    setState({ user: null, token: null, isLoading: false });
    window.location.hash = '#/login';
  };

  const updateUser = (user: User) => {
    setState(prev => {
      const newState = { ...prev, user };
      localStorage.setItem('todo_app_session', JSON.stringify({ user, token: prev.token }));
      return newState;
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
