
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/mockApi';
import { Todo, TodoCategory, UserRole } from '../types';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

interface TodoFormPageProps {
  editId?: string;
}

export const TodoFormPage: React.FC<TodoFormPageProps> = ({ editId }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    category: TodoCategory.NON_URGENT
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!editId);

  useEffect(() => {
    if (editId && user) {
      const loadTodo = async () => {
        try {
          // Admin can edit any todo, users can only fetch their own
          const roleToFetch = user.role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.USER;
          const todos = await api.fetchTodos(user.id, roleToFetch);
          const todo = todos.find(t => t.id === editId);
          if (todo) {
            setFormData({
              title: todo.title,
              description: todo.description || '',
              dueDate: todo.dueDate || '',
              category: todo.category
            });
          } else {
            alert('Todo not found');
            window.location.hash = '#/';
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsFetching(false);
        }
      };
      loadTodo();
    }
  }, [editId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      setErrors({ title: 'Title is required' });
      return;
    }
    if (formData.title.length > 100) {
      setErrors({ title: 'Title must be less than 100 characters' });
      return;
    }
    if (formData.description.length > 500) {
      setErrors({ description: 'Description must be less than 500 characters' });
      return;
    }

    setIsLoading(true);
    try {
      if (editId) {
        await api.updateTodo(editId, formData, user!.id, user!.role);
      } else {
        await api.createTodo({
          ...formData,
          userId: user!.id
        });
      }
      window.location.hash = '#/';
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="p-10 text-center text-slate-500">Loading task details...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => window.location.hash = '#/'} className="p-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">{editId ? 'Edit Task' : 'Create New Task'}</h1>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Title"
            placeholder="What needs to be done?"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            error={errors.title}
            required
          />

          <Input 
            isTextArea
            label="Description (Optional)"
            placeholder="Add some details about this task..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            error={errors.description}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
            />

            <Input 
              isSelect
              label="Category"
              options={[
                { value: TodoCategory.NON_URGENT, label: 'Non-Urgent' },
                { value: TodoCategory.URGENT, label: 'Urgent' }
              ]}
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as TodoCategory })}
            />
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <Button type="submit" className="flex-1" isLoading={isLoading}>
              {editId ? 'Update Task' : 'Create Task'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => window.location.hash = '#/'}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
