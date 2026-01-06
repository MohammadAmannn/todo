
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/mockApi';
import { Todo, TodoCategory, UserRole } from '../types';
import { TodoCard } from '../components/TodoCard';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | TodoCategory>('all');
  const [viewMode, setViewMode] = useState<'personal' | 'all'>(user?.role === UserRole.ADMIN ? 'all' : 'personal');

  const fetchTodos = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Admin can toggle between personal and all views
      const roleToFetch = viewMode === 'all' ? UserRole.ADMIN : UserRole.USER;
      const data = await api.fetchTodos(user.id, roleToFetch);
      setTodos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user, viewMode]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      await api.updateTodo(id, { completed }, user!.id, user!.role);
      setTodos(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
    } catch (err) {
      alert('Action failed: ' + (err as any).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.deleteTodo(id, user!.id, user!.role);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const filteredTodos = todos.filter(t => {
    const matchesStatus = filter === 'all' || (filter === 'active' ? !t.completed : t.completed);
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || (t.description?.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesStatus && matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Task Dashboard</h1>
          <p className="text-slate-500">Manage and track your todos</p>
        </div>
        
        <div className="flex gap-2">
          {user?.role === UserRole.ADMIN && (
            <div className="bg-slate-100 p-1 rounded-lg flex">
              <button 
                onClick={() => setViewMode('personal')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'personal' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Personal
              </button>
              <button 
                onClick={() => setViewMode('all')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                All Users
              </button>
            </div>
          )}
          <Button onClick={() => window.location.hash = '#/todo/new'}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Input 
            label="Search Tasks"
            placeholder="Filter by title or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="!mb-0"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['all', 'active', 'completed'] as const).map(s => (
              <button 
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1 text-xs font-semibold capitalize rounded-md transition-all ${
                  filter === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="w-32">
          <Input 
            isSelect 
            label="Category"
            options={[
              { value: 'all', label: 'All' },
              { value: TodoCategory.URGENT, label: 'Urgent' },
              { value: TodoCategory.NON_URGENT, label: 'Non-Urgent' }
            ]}
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value as any)}
            className="!mb-0"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-100 rounded-xl"></div>
          ))}
        </div>
      ) : filteredTodos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTodos.map(todo => (
            <TodoCard 
              key={todo.id}
              todo={todo}
              currentUserId={user!.id}
              currentUserRole={user!.role}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={(t) => window.location.hash = `#/todo/edit/${t.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-dashed border-slate-300 rounded-2xl">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 flex items-center justify-center rounded-full mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800">No tasks found</h3>
          <p className="text-slate-500">Try changing your filters or create a new task</p>
          <Button variant="ghost" className="mt-4" onClick={() => { setFilter('all'); setSearch(''); setCategoryFilter('all'); }}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
};
