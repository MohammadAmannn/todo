import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/mockApi';
import { User, UserRole, Todo } from '../types';
import { Button } from '../components/Button';

export const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'todos'>('users');

  useEffect(() => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [userData, todoData] = await Promise.all([
          api.fetchAllUsers(),
          api.fetchTodos(UserRole.ADMIN)
        ]);
        setUsers(userData);
        setTodos(todoData);
      } catch (err) {
        console.error('Admin dashboard load failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const handleRoleChange = async (targetUserId: string, currentRole: UserRole) => {
    if (targetUserId === currentUser?.id) {
      alert('You cannot change your own role.');
      return;
    }

    const newRole =
      currentRole === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;

    if (!confirm(`Change user role to ${newRole.toUpperCase()}?`)) return;

    try {
      const updatedUser = await api.updateUserRole(targetUserId, newRole);
      setUsers(prev =>
        prev.map(u => (u.id === targetUserId ? updatedUser : u))
      );
    } catch {
      alert('Role change failed');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!confirm('Admin: Delete this todo globally?')) return;

    try {
      await api.deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch {
      alert('Delete failed');
    }
  };

  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
    return (
      <div className="text-red-600 p-10 font-bold">
        Access Denied: Admin Only
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Central</h1>
        <p className="text-slate-500">System management and oversight</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-4 px-4 text-sm font-semibold border-b-2 ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500'
          }`}
        >
          User Management ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('todos')}
          className={`pb-4 px-4 text-sm font-semibold border-b-2 ${
            activeTab === 'todos'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500'
          }`}
        >
          Global Todos ({todos.length})
        </button>
      </div>

      {isLoading ? (
        <div className="p-20 text-center text-slate-400">Loading...</div>
      ) : activeTab === 'users' ? (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="px-6 py-4">{u.username}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">{u.role}</td>
                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={u.id === currentUser.id}
                      onClick={() => handleRoleChange(u.id, u.role)}
                    >
                      {u.role === UserRole.ADMIN ? 'Demote' : 'Promote'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {todos.map(t => (
                <tr key={t.id}>
                  <td className="px-6 py-4">{t.title}</td>
                  <td className="px-6 py-4">{t.userName}</td>
                  <td className="px-6 py-4">{t.category}</td>
                  <td className="px-6 py-4">
                    {t.completed ? 'Done' : 'Pending'}
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => handleDeleteTodo(t.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {todos.length === 0 && (
            <div className="p-10 text-center text-slate-400">
              No todos in system
            </div>
          )}
        </div>
      )}
    </div>
  );
};
